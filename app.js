//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const _=require("lodash");
mongoose.connect('mongodb://localhost:27017/tododb', { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your TODO list"
});

const item2 = new Item({
    name: "Hit + to add a new item"
});

const item3 = new Item({
    name: "<--- Hit this to delete an item"
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];





app.get("/", function(req, res) {

    Item.find(function(err, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if (err)
                    console.log(err);
                else
                    console.log("Successfully Inserted");
            })
        }
        res.render("list", { listTitle: "Today", newListItems: items });
    });



});

app.post("/delete", function(req, res) {
    x = (req.body.checkbox);
    title = req.body.list;

    if (title === "Today") {
        Item.findByIdAndRemove(req.body.checkbox, function(err) {
            if (err)
                console.log(err);
        });
        res.redirect("/");
    }
    else{
      List.findOneAndUpdate({name:title},{$pull:{items:{_id:x}}},function(err,lists){
        if(err)
          console.log(err);
        else res.redirect("/"+title);
      });
    }


});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const title = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (title === "Today") {
        item.save();
        res.redirect("/");
    } else {

        List.findOne({ name: title }, function(err, lists) {
            if (!err) {

                lists.items.push(item);
                lists.save();
                res.redirect("/" + title);
            } else console.log(err);

        });
    }





});

app.get("/:kuch", function(req, res) {
    const x = _.capitalize(req.params.kuch);


    List.findOne({ name: x }, function(err, lists) {
        if (err) {
            console.log(err);
        } else {
            if (lists) {
                res.render("list", { listTitle: lists.name, newListItems: lists.items });
            } else {
                const list = new List({
                    name: x,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + x);
            }
        }
    });




});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});