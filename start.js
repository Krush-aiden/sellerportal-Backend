// const { response } = require("express");

// const { json } = require("body-parser");

// console.log('hello')

const saveBtn = document.getElementById("saveBTN");
// const fileSystem = require('fs')

// saveBtn.addEventListener('click', ()=>{
//         console.log('hello after click');
// });

// const name = document.getElementById('nameInput').value;
// const email = document.getElementById('emailInput').value;

const form = document.getElementById('myForm');

// const form = document.getElementById("myForm");

const file = document.getElementById("fileInput");
const namevalue = document.getElementById("nameInputID");
const addressvalue = document.getElementById("AddressInputID");
const phoneNoValue = document.getElementById("PhoneNoInputID");





async function sendData() {
  // Associate the FormData object with the form element

  // console.log('fileValue', fileValue)
  // console.log('namevalue', namevalue.value)

  const formData = new FormData();
  // const fileValue =  formData.get('myFile');
  formData.append('myFile', file.files[0]);
  formData.append('namevalue', namevalue.value);
  formData.append('addressvalue',addressvalue.value);
  formData.append('phoneNoValue', phoneNoValue.value);
  
  try {
    const response = await fetch("http://127.0.0.1:3000/toDoList", {
      method: "POST",
      headers: {
        // 'Content-Type': 'application/json',
      },

      // Set the FormData instance as the request body => to send the value in a JSON Format
      // body: JSON.(stringify({
      //   userValues
      // }))

      body : formData

    });
    console.log(await response.json());
  } catch (e) {
    console.error(e);
  }
}


const imagePath = document.getElementById('image')
const nameViewset = document.getElementById('nameView')

// console.log('imagePath', imagePath)

// imagePath.src = 'png.jpeg';

async function viewData() {

  const getResponse = await fetch("http://127.0.0.1:3000/toDoList/", {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    },
   
    // body: JSON.stringify({})
});

console.log('getResponse', getResponse)
  const value = await getResponse.json();
  console.log('value', value);
    // console.log('value',value.res[4].filename);
    // console.log('value.res[1].name', value.res[4].filename);

    // nameViewset.innerHTML = value.res[2].name;
    // imagePath.src = value.res[4].filename;
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
});

let viewBTN = document.getElementById('viewID');

// console.log(viewBTN);

viewBTN.addEventListener("click", (event) => {
  event.preventDefault();
  viewData();
});