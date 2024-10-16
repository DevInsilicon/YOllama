import axios from 'axios';
import yollama from '../dist/index.js';

let OInstance = new yollama.OInstance("http://127.0.0.1:14434", true);
console.log(OInstance.isConnected());

//wait 1 sec
setTimeout(async () => {
    console.log(OInstance.isConnected());

    let ContextClass = new yollama.ContextClass(OInstance, true);

    ContextClass.JSONrequest('llama3.2', [
        {
            "User": "SYSTEM",
            "prompt": "Your job is to say a nice greeting to the user.",
        },
        {
            "name": "Assistant(You)",
            "prompt": "Hello! How are you doing today?"
        },
        {
            "name": "User",
            "prompt": "Hello!"
        }
    ], false)
        .then(jsonResponse => console.log(jsonResponse))
        .catch(error => console.error(error));
}, 1000);