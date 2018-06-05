console.log("ScriptStarted");
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "xml/FamilyData.xml", false);
xmlhttp.send();
var xmlDoc = xmlhttp.responseXML;
var sortedList = new Array();
var typesList = new Array();
var instalMedium = new Array();
var selectedItem;
// console.log(xmlhttp.responseXML);

var ceiling = document.getElementById("placementCeiling");
var wall = document.getElementById("placementWall");
var floor = document.getElementById("placementFloor");

var external = document.getElementById("externalMount");
var internal = document.getElementById("internalMount");

var family = xmlDoc.getElementsByTagName("FamilyData");
for (var i = 0; i < family.length; i++) {
    var types = family[i].getElementsByTagName("FamilyTypeData");
    for (var j = 0; j < types.length; j++) {
        var category = family[i].getElementsByTagName("Category")[0].childNodes[0].nodeValue;
        var typeName = types[j].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
        var typeDescription = " --- ";

        try {
            typeDescription =
                types[j].getElementsByTagName("Description")[0].childNodes[0].nodeValue.replace(
                    /(\r\n\t|\n|\r\t)/gm,
                    "");
        } catch (error) {
            console.error(error);
        }
        var typeCombinedDescription = types[j].getElementsByTagName("CombinedTypeData")[0].childNodes[0].nodeValue;
        var typeMount = types[j].getElementsByTagName("MountType")[0].childNodes[0].nodeValue;
        var typePlacement = types[j].getElementsByTagName("Placement")[0].childNodes[0].nodeValue;
        var typeInstalMedium = types[j].getElementsByTagName("InstallationMedium")[0].childNodes[0].nodeValue;

        //--create object
        var webType = {
            category: category,
            typeDescription: typeDescription,
            typeName: typeName,
            typeMount: typeMount,
            typePlacement: typePlacement,
            typeInstalMedium: typeInstalMedium
        }
        typesList.push(webType);
    }
}

updateTable(typesList);

//----------------Methods---------------------------
function search() {
    var input = document.getElementById("searchInput");
    var searchList = new Array();
    if (sortedList.length === 0) {
        for (var i = 0; i < typesList.length; i++) {
            if (typesList[i].typeName.includes(input.value) || typesList[i].typeDescription.includes(input.value))
                searchList.push(typesList[i]);
        }
    } else {
        for (var j = 0; j < sortedList.length; j++) {
            if (sortedList[j].typeName.includes(input.value) || sortedList[j].typeDescription.includes(input.value))
                searchList.push(sortedList[j]);
        }
    }
    updateTable(searchList);
}

function selectCategory(categoryName) {
    instalMedium = new Array();
    sortedList = new Array();
    for (var j = 0; j < typesList.length; j++) {
        if (typesList[j].category === categoryName) {
            sortedList.push(typesList[j]);
        }
    }
    var instalMediumAll = new Array();
    if (sortedList.length !== 0) {
        for (var i = 0; i < sortedList.length; i++) {
            instalMediumAll.push(sortedList[i].typeInstalMedium);
        }
    } else {
        for (var l = 0; l < typesList.length; l++) {
            instalMediumAll.push(typesList[l].typeInstalMedium);
        }
    }

    $.each(instalMediumAll,
        function (i, el) {
            if ($.inArray(el, instalMedium) === -1) instalMedium.push(el);
        });

    var instalCategories = "";
    for (var i = 0; i < instalMedium.length; i++) {

        instalCategories += "<p><div style=\"float: left; width: 40px\">" +
            "<label class=\"switch\">" +
            "<input id=\"instalSwitch" +
            instalMedium[i] +
            "\" type=\"checkbox\" onclick=\"sortData()\">" +
            "<span class=\"slider round\"></span>" +
            "</label>" +
            "</div>" +
            "<div>" +
            instalMedium[i] +
            "</div></p>";
    }
    document.getElementById("installMediumCategories").innerHTML = instalCategories;

    ceiling.checked = false;
    wall.checked = false;
    floor.checked = false;

    internal.checked = false;
    external.checked = false;

    updateTable(sortedList);
}

function updateTable(typesList) {
    var tableUpdated =
        "<colgroup><col style=\"width: 6%\">" +
        "<col style=\"width: 20%\">" +
        "<col style=\"width: 50%\">" +
        "<col style=\"width: 8%\">" +
        "<col style=\"width: 8%\">" +
        "<col style=\"width: 12%\">" +
        "</colgroup>" +
        "<tr>" +
        "<th>Bild</th>" +
        //"<th>Category</th>" +
        "<th>Beschreibung</th>" +
        "<th>Type Name</th>" +
        "<th ></th>" +
        "<th ></th>" +
        "<th >Installation Medium</th>" +
        "</tr>";
    for (var i = 0; i < typesList.length; i++) {
        tableUpdated += "<tr>" +
            "<td style=\"text- align: center;\"><img src= \"typeImages/" + typesList[i].typeName + ".PNG\" style=\"width:32px; height:32px\"/>" +
            "<td>" + typesList[i].typeDescription.replace(/(\r\n\t|\n|\r\t)/gm, "") + "</td>" +
            "<td><a class=\"btn btn-link\" onclick=\"showDetails(this.innerText)\" style=\"white-space: normal; word-wrap: break-word\" target=\"_blanc\">" + typesList[i].typeName.replace(/(\r\n\t|\n|\r\t)/gm, "") + "</a></td>" +

            "<td>" + typesList[i].typeMount + "</td>" +
            "<td>" + typesList[i].typePlacement + "</td>" +
            "<td>" + typesList[i].typeInstalMedium + "</td>" +
            "</tr>";
    }
    document.getElementById("TypeData").innerHTML = tableUpdated;
}

function sortData() {
    var sortedResult = new Array();
    var selectMountArr = selectMount();
    var selectPlacementArr = selectPlacement();
    var selectMediumArr = selectMedium();

    for (var i = 0; i < selectMountArr.length; i++) {
        for (var j = 0; j < selectPlacementArr.length; j++) {
            for (var k = 0; k < selectMediumArr.length; k++) {
                if (selectMountArr[i] === selectPlacementArr[j] && selectMountArr[i] === selectMediumArr[k])
                    sortedResult.push(selectMountArr[i]);
            }
        }
    }
    updateTable(sortedResult);
}

function selectMedium() {
    var selectArr = new Array();
    for (var i = 0; i < instalMedium.length; i++) {
        if (document.getElementById("instalSwitch" + instalMedium[i]).checked) {
            for (var j = 0; j < sortedList.length; j++) {
                if (sortedList[j].typeInstalMedium === instalMedium[i])
                    selectArr.push(sortedList[j]);
            }
        }
    }
    if (selectArr.length === 0)
        selectArr = sortedList;
    return selectArr;
}


function selectMount() {
    var sortedListMount = new Array();
    var emptyArr = sortEmptyMount();
    var internalArr = sortMount(internal, "UP");
    var externalArr = sortMount(external, "AP");

    sortedListMount = emptyArr.concat(internalArr);
    sortedListMount = sortedListMount.concat(externalArr);

    if (!internal.checked && !external.checked) {
        if (sortedList.length !== 0) {
            sortedListMount = sortedList;
        } else {
            sortedListMount = typesList;
        }
    }
    return sortedListMount;
}

function sortMount(state, mount) {
    var sortedListMount = new Array();
    if (state.checked) {
        if (sortedList.length !== 0) {
            for (var i = 0; i < sortedList.length; i++) {
                if (sortedList[i].typeMount === mount || sortedList[i].typeMount === "N" + mount)
                    sortedListMount.push(sortedList[i]);
            }
        } else {

            for (var j = 0; j < typesList.length; j++) {
                if (typesList[j].typeMount === mount || typesList[j].typeMount === "N" + mount)
                    sortedListMount.push(typesList[j]);
            }
        }
    }
    return sortedListMount;
}

function sortEmptyMount() {
    var sortedListMount = new Array();
    if (sortedList.length > 0) {
        for (var i = 0; i < sortedList.length; i++) {
            if (sortedList[i].typeMount === " --- ")
                sortedListMount.push(sortedList[i]);
        }
    } else {
        for (var j = 0; j < typesList.length; j++) {
            if (typesList[j].typeMount === " --- ")
                sortedListMount.push(typesList[j]);
        }
    }

    return sortedListMount;
}

function selectPlacement() {

    var sortedListPlacement = new Array();
    var emptyPlacementArr = sortEmptyPlacement();
    var floorPlacementArr = sortPlacement(floor, "Boden");
    var ceilingPlacementArr = sortPlacement(ceiling, "Decke");
    var wallPlacementArr = sortPlacement(wall, "Wand");

    sortedListPlacement = emptyPlacementArr.concat(floorPlacementArr);
    sortedListPlacement = sortedListPlacement.concat(ceilingPlacementArr);
    sortedListPlacement = sortedListPlacement.concat(wallPlacementArr);

    if (!floor.checked && !wall.checked && !ceiling.checked) {
        if (sortedList.length !== 0) {
            sortedListPlacement = sortedList;
        } else {
            sortedListPlacement = typesList;
        }
    }
    return sortedListPlacement;
}

function sortPlacement(state, place) {
    var sortedListPlacement = new Array();
    if (state.checked) {
        if (sortedList.length > 0) {
            for (var i = 0; i < sortedList.length; i++) {
                if (sortedList[i].typePlacement === place)
                    sortedListPlacement.push(sortedList[i]);
            }
        } else {
            for (var j = 0; j < typesList.length; j++) {
                if (typesList[j].typePlacement === place)
                    sortedListPlacement.push(typesList[j]);
            }
        }
    }

    return sortedListPlacement;
}

function sortEmptyPlacement() {
    var sortedListPlacement = new Array();
    if (sortedList.length > 0) {
        for (var i = 0; i < sortedList.length; i++) {
            if (sortedList[i].typePlacement === " --- ")
                sortedListPlacement.push(sortedList[i]);
        }
    } else {
        for (var j = 0; j < typesList.length; j++) {
            if (typesList[j].typePlacement === " --- ") {
                sortedListPlacement.push(typesList[j]);
            }
        }
    }
    return sortedListPlacement;
}

function showDetails(value) {
    // var selectedItem;

    for (var i = 0; i < typesList.length; i++) {
        if (typesList[i].typeName.replace(/\s+/g, "").includes(value.replace(/\s+/g, ""))) {
            selectedItem = typesList[i];
        }
    }

    var newWindow = window.open('Home/Details', 'Details');
    newWindow.onload = function () {

        var typeName = newWindow.document.getElementById("typeName");
        typeName.innerHTML = selectedItem.typeName;
        var typeDescription = newWindow.document.getElementById("typeDescription");
        typeDescription.innerHTML = selectedItem.typeDescription;
        var typePlacement = newWindow.document.getElementById("typePlacement");
        typePlacement.innerHTML = selectedItem.typePlacement;
        var typeMount = newWindow.document.getElementById("typeMount");
        typeMount.innerHTML = selectedItem.typeMount;
        var typeInstalMedium = newWindow.document.getElementById("typeInstalMedium");
        typeInstalMedium.innerHTML = selectedItem.typeInstalMedium;

        var picture = newWindow.document.getElementById("Picture");
        picture.innerHTML = "<img src= \"/typeImages/" + selectedItem.typeName + ".PNG\" style=\"width:240px; height:240px\">";

        var uploadField = newWindow.document.getElementById("typeFileName");
        uploadField.value = selectedItem.typeName;
        var submitButton = newWindow.document.getElementById("typeNameSubmit");
        submitButton.click();
        console.log();
    }
}