var page = 0;
var startTime = new Date().toUTCString();
var id = Math.floor(Math.random() * 10000);
var admin, db, surveyResponse, ref = null;


function nextPage()
{
  document.querySelectorAll('.page').forEach(function(pageElement) {
    pageElement.style.display = "none";
  });
  document.getElementById("page" + page).style.display = "block";

  /*collectAndSendInputs()*/

  if(page === 2)
  {
    calcCombos()
    next()
  }

  if(page === 4)
  {
    calcCombos()
    next()
  }
  page++
}

function validator()
{
  let allAreFilled = true;
  document.getElementById("promptForm").querySelectorAll("[required]").forEach(function(i) {
    if (!allAreFilled) return;
    if (i.type === "radio") {
      let radioValueCheck = false;
      document.getElementById("promptForm").querySelectorAll(`[name=${i.name}]`).forEach(function(r) {
        if (r.checked) radioValueCheck = true;
      })
      allAreFilled = radioValueCheck;
      return;
    }
    if (!i.value) { allAreFilled = false;  return; }
  })
  if (!allAreFilled) {
    alert('Fill all the fields');
  } else {
    nextPage()
  }
}

function previousPage(){
  page = page-1
  document.querySelectorAll('.page').forEach(function(pageElement) {
    pageElement.style.display = "none";
  });
  document.getElementById("page" + page).style.display = "block";

}

function collectAndSendInputs() {
  var inputs = document.querySelectorAll("input")
  var textareas = document.querySelectorAll("textarea")
  var sendObject = {}

  for (var i = 0; i < inputs.length; i++)
  {
    if(inputs[i].type == "radio" || inputs[i].type == "checkbox")
      sendObject[inputs[i].id] = inputs[i].checked
    else
      sendObject[inputs[i].id] = inputs[i].value;
  }

  for (var i = 0; i < textareas.length; i++)
  {
    sendObject[textareas[i].id] = textareas[i].value;
  }

  sendObject["pairwise"] = answers
  sendObject["id"] = id
  sendObject["startTime"] = startTime
  sendObject["completeTime"] = new Date().toUTCString();

  ref.set(sendObject)
}

function start()
{
  nextPage();
}
