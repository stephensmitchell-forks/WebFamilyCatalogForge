using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Autodesk.Forge;

namespace WebFamilyCatalogForge.Controllers
{
    public class TockenController : Controller
    {
        [HttpGet]
        [Route("api/forge/token")]
        public async Task<string> GetToken()
        {
            TwoLeggedApi oauthApi = new TwoLeggedApi();
            dynamic bearer = await oauthApi.AuthenticateAsync(
                "BAWRvT8keOIWLzVKoRKUq8AtN5j0iuhO",
                "Pd3dfc9d0f6f6488",
                "client_credentials",
                new Scope[] { Scope.DataRead });

            return (string)bearer.access_token;
        }
    }
}