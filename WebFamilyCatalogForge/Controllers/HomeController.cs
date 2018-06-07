using Autodesk.Forge;
using Autodesk.Forge.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace WebFamilyCatalogForge.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index(string URN)
        {
            return View((object)URN);
        }

        public IActionResult Details(string URN)
        {
            return View((object)URN);
        }

        [HttpPost]
        public async Task<IActionResult> IndexName(string DATA)
        {
            string fileName = Directory.GetCurrentDirectory() + @"\wwwroot\typeFiles\" + DATA + ".rvt";
            //Create Bucket Name
            string bucketKey = "forgeapp" + Guid.NewGuid().ToString("N").ToLower();

            TwoLeggedApi oauthApi = new TwoLeggedApi();

            dynamic bearer = await oauthApi.AuthenticateAsync(
                "BAWRvT8keOIWLzVKoRKUq8AtN5j0iuhO",
                "Pd3dfc9d0f6f6488",
                "client_credentials",
                new Scope[] { Scope.BucketCreate, Scope.DataCreate, Scope.DataWrite, Scope.DataRead });

            //Create Forge Bucket
            PostBucketsPayload postBucket = new PostBucketsPayload(bucketKey, null, PostBucketsPayload.PolicyKeyEnum.Transient);
            BucketsApi bucketApi = new BucketsApi();
            bucketApi.Configuration.AccessToken = bearer.access_token;

            dynamic newBucket = await bucketApi.CreateBucketAsync(postBucket);

            ObjectsApi objectsApi = new ObjectsApi();
            oauthApi.Configuration.AccessToken = bearer.access_token;
            dynamic newObject;
            using (StreamReader fileStream = new StreamReader(fileName))
            {
                newObject = await objectsApi.UploadObjectAsync(bucketKey, fileName, (int)fileStream.BaseStream.Length,
                    fileStream.BaseStream, "application/octet-stream"); //TODO add comment
            }

            //Translate File
            string objectIdBase64 = ToBase64(newObject.objectId);
            List<JobPayloadItem> postTranslationOutput = new List<JobPayloadItem>()
            {
                new JobPayloadItem(
                    JobPayloadItem.TypeEnum.Svf, new List<JobPayloadItem.ViewsEnum>()
                    {
                        JobPayloadItem.ViewsEnum._2d,
                        JobPayloadItem.ViewsEnum._3d
                    })
            };

            JobPayload postTranslation = new JobPayload(
                new JobPayloadInput(objectIdBase64),
                new JobPayloadOutput(postTranslationOutput));

            DerivativesApi derivativeApi = new DerivativesApi();
            derivativeApi.Configuration.AccessToken = bearer.access_token;
            dynamic translation = await derivativeApi.TranslateAsync(postTranslation);

            //Translation finish check
            int progress = 0;
            do
            {
                System.Threading.Thread.Sleep(1000);
                try
                {
                    dynamic manifest = await derivativeApi.GetManifestAsync(objectIdBase64);
                    progress = (string.IsNullOrEmpty(Regex.Match(manifest.progress, @"\d+").Value)
                        ? 100
                        : Int32.Parse(Regex.Match(manifest.progress, @"\d+").Value));
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error in translation: " + ex.Message);
                }
            } while (progress < 100);

            return RedirectToAction("Details", new { URN = (object)objectIdBase64 });
        }

        public string ToBase64(string input)
        {
            var plainText = System.Text.Encoding.UTF8.GetBytes(input);
            return System.Convert.ToBase64String(plainText);
        }


        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
