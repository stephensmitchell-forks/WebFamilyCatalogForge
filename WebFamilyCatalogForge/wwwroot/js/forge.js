var viewerApp;
var model;

function showModel(urn) {

    console.log("Forge action started");
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getAccessToken,
        refreshToken: getAccessToken
    };

    var documentId = 'urn:' + urn;

    if (window.Autodesk === undefined) {
        console.log("Viewing " + window.Autodesk);

    } else {
        window.Autodesk.Viewing.Initializer(options, function onInitialized() {
            viewerApp = new window.Autodesk.Viewing.ViewingApplication("ForgeDiv");
            viewerApp.registerViewer(viewerApp.k3D, window.Autodesk.Viewing.Private.GuiViewer3D);
            viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
    }
}

function onDocumentLoadSuccess(doc) {

    var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }
    document = doc;
    viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
    model = viewer.model;
}

function onItemLoadFail(errorCode) {
    console.error('onItemLoadFail() - errorCode:' + errorCode);
}

function getAccessToken() {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/api/forge/token', false /*forge viewer requires SYNC*/);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}