// importing npm packages{
    const express = require("express");
    const app = express();
let port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { renderFile } = require("ejs");
const { toUnicode } = require("punycode");
const dotenv =require('dotenv').config();
const password= (process.env.PASS);
const username=(process.env.USER)
// }
//
// setting up ejs and body parser for post request & settijng up static folder {
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(__dirname + "/public"));
    // }
    //
    // setting up date for heading{
        let dayName = "";
        let day = new Date();
        /**  For year  **/
        const year = day.getFullYear();
        let options = { weekday: "long", month: "long", day: "numeric" };
        let date = day.toLocaleDateString("en-US", options);
        // }

//**************************************************************************************************************************************/

// Setup  of database: MongoDB{
const todoSchema = mongoose.Schema({
    name: String,
});
const todoItem = mongoose.model("todoItem", todoSchema);

async function runDatabase() {
    const uri = `mongodb+srv://${username}:${password}@cluster0.lfqfli0.mongodb.net/TodoList`;
    await mongoose.connect(uri, { useNewUrlParser: true }).then(()=>{
        console.log('you got connected to mongoDB server')
    }).catch((err)=>{
console.log(err,'got an error in connecting to mongoDB server')
    });
}
async function closeDatabase() {
    await mongoose.connection.close().then(()=>{
        console.log('you got disconnected to mongoDB server')
    }).catch((err)=>{
console.log(err,'got an error in disconnecting to mongoDB server')
    });;
}
// }
//
// default items of the list {
let item1 = new todoItem({
    name: "shopping",
});
let item2 = new todoItem({
    name: "singing",
});
let item3 = new todoItem({
    name: "skating",
});
const defaultItems=[item1, item2, item3]
// }

//**************************************************************************************************************************************/

/** Get request **/
app.get("/", async (req, res) => {
    // staring database
    await runDatabase();
    await todoItem.find({}).then(async (value) => {
        // if default items are not present in the database then create {
        if (value.length === 0) {
            await todoItem.insertMany(defaultItems)
            res.redirect("/");
        }
        // }
        //
        // else render the page with the presented data{
        else {
            res.render("list", { todaysDay: date, newItems: value, year: year,listBtn:'Today', thisList:'Today'});
        }
        // }
    }).catch((err)=>{
        console.log(err,'error in finding')
    });
    //   close database
    await closeDatabase();
});

//**************************************************************************************************************************************/

/** Post request **/
app.post("/",async (req, res) => {
    let itemValue = req.body.listItem;
    let listLocation=(req.body.button)
    // again starting the MongoDB server
    await runDatabase()
    let itemAdded = new todoItem({
        name: itemValue,
    });
    if (listLocation=='Today') {
       
        // inserting a new item into database as a document
        await itemAdded.save().then(()=>{
            console.log('added')
        }).catch((err)=>{
    console.log(err,'got an error in adding')
        });;
        // closing it 
        await closeDatabase()
        res.redirect("/");
    }
    else{
       await list.findOne({name:listLocation}).then(async (value)=>{
            
            value.items.push(itemAdded);
            await value.save();
            // closing it 
            await closeDatabase()
            res.redirect("/"+listLocation);
        }).catch((err)=>{
            console.log(err,'error in finding')
        })
    }
});

//**************************************************************************************************************************************/

// another post request for deleting item
app.post('/delete',async (req,res)=>{
     //  // again starting the MongoDB server
     await runDatabase()
   let deleteId=(req.body.deleteCheckbox)
   let onList=(req.body.currentlist)
   
   if(onList=='Today'){
    await todoItem.deleteOne({_id:deleteId}).then(()=>{
        console.log('deleted ')
    }).catch((err)=>{
console.log(err,'got an error in deleting to mongoDB server')
    });
     // closing it 
     await closeDatabase()
    res.redirect('/')
   }
   else{
     await list.findOneAndUpdate({name:onList},{$pull:{items:{_id:deleteId}}}).then(()=>{
        console.log('found it and updated it')
    }).catch((err)=>{
console.log(err,'got an error in find and update to mongoDB server')
    });
     // closing it 
     await closeDatabase()
    res.redirect('/'+ onList)}
})

//**************************************************************************************************************************************/ 

// diffrent list with route

const listSchema = mongoose.Schema({
    name:String,
    items:[todoSchema]
});
const list = mongoose.model("list", listSchema);
// 
app.get('/:input',async (req,res)=>{
    await runDatabase()
    const listName=(req.params.input)
   const modifiedListName=listName.slice(0,1).toUpperCase()+listName.slice(1,listName.length).toLowerCase()

await list.findOne({name:listName}).then(async (value)=>{
    if(!value){
        let listMaker=new list({
            name:listName,
            items:defaultItems
        })
        await listMaker.save()
    
        res.redirect('/'+listName)
    }
    else{
        res.render("list", { todaysDay:modifiedListName , newItems: value.items, year: year ,listBtn:value.name, thisList:value.name})
        
    }
    }).catch((err)=>{
        console.log(err,'error in finding!')
    })
await closeDatabase()
})
//**************************************************************************************************************************************/

/**listening on Port:3000**/
app.listen(process.env.PORT || port, (err) => {
    if (err) {
        console.log("error occured");
    } else {
        console.log(` server is running on port ${port}`);
    }
});
