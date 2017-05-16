
//********************************** AUTHOR: RAVINDER SONI

//*********************************** VARIABLE DECLARATION
var mysql = require("mysql");
var inquirer = require("inquirer");
var fs = require("fs");
var request = require("request");
var action = process.argv;
var FOUND = '';
var UNAME1 = "SUPERVISOR";
var PWD1 = "";
var xx = '';
var OUT;
var connection;
var res1;

//************* Authenticating Supervisor (COMMAND LINE INPUT)

if (action[2] === "SUPERVISOR") {
    inquirer.prompt([{
        type: "password",
        name: "PWD1",
        message: "Enter Supervisor Password?"

    }]).then(function(user) {
        makeConnection()
        PWD1 = user.PWD1;
        connection.query("call bamazon.SPUSERAUTH('" + UNAME1 + "','" + PWD1 + "',@OUT);", function(err, data) {
            if (err) throw err;

            xx = data[1][0].FOUNDUSER;

            if (xx === 'TRUE') {
                //	process.stdout.write('\033c');

                console.log("Connected as " + UNAME1);
                connection.end();

            } else {
                console.log("Wrong Password Try Again");

            }



            if (xx === 'FALSE') {
                connection.end();
                console.log("Exiting Program");
                process.exit();
            } else
            if (xx === 'TRUE') {
                //Show Sup Menu

                console.log("---- Supervisor Menu-----");
                showSupMenu();
                //	displaystk();
                console.log("---- bAmazon-----");

            }
        })
    })
} else {
    //*************************************** Non Supervisor Entry Point and Authentication
    process.stdout.write('\033c');
    inquirer.prompt([{
        type: "input",
        name: "UNAME1",
        message: "Enter User Name?"

    }, {
        type: "password",
        name: "PWD1",
        message: "Enter User Password?"
    }]).then(function(user1) {
        makeConnection();
        PWD1 = user1.PWD1;
        UNAME1 = user1.UNAME1;
        connection.query("call bamazon.SPUSERAUTH('" + UNAME1 + "','" + PWD1 + "',@OUT);", function(err, data) {
            if (err) throw err;

            xx = data[1][0].FOUNDUSER;

            if (xx === 'TRUE') {


                console.log("Connected as " + UNAME1);
                connection.end();

            } else

            {
                console.log("Wrong UserName/ Password Try Again");

            }


            if (xx === 'FALSE') {
                console.log("Exiting Program");
                connection.end();
                process.exit();
            } else
            if (xx === 'TRUE')


            {
                //Show Member Menu

                showMemberMenu();
                displaystk();
                console.log("---- bAmazon-----");

            } //-------------

        })
    })
}



//************************************ Creating Server Connection
function makeConnection() {
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: 'root',
        password: 'ravi1962',
        database: 'bamazon'

    });
}

//******************************* Data Manupulation Add/Edit

function newItemEntry()
{
    process.stdout.write('\033c');

console.log("---- ENTER NEW STOCK ----")
    inquirer.prompt([{
        type: "input",
        name: "itemName",
        message: "Enter Item Name?",
    	}, 

		{
        type: "input",
        name: "itemDesc",
        message: "Enter Item Details?",
    	}, 

		{
        type: "input",
        name: "itemStock",
        message: "Enter Stock?",
    	}, 

		{
        type: "input",
        name: "itemRor",
        message: "Enter ReOrder Level?",
   		 }, 
		{
        type: "input",
        name: "itemRate",
        message: "Enter Item Rate?",

    	}]).then(function(user1) {
        makeConnection();
        connection.query("INSERT INTO bamazon.tblstockhead06 (ITEMNAME06, ITEMDESC06, ITEMSTOCK06, ITEMREORDER06, ITEMRATE06) VALUES ('"+user1.itemName+"', '"+user1.itemDesc+"', '"+user1.itemStock+"', '"+user1.itemRor+"', '"+user1.itemRate+"');"),
          function(err, data) {
                if (err) throw err;
            }

             showSupMenu();


    })
}

function stockEdit() {
    process.stdout.write('\033c');


    inquirer.prompt([{
        type: "input",
        name: "itemid",
        message: "Enter Item ID?",
    }, {
        type: "input",
        name: "addstk",
        message: "Add Qty?"
    }]).then(function(user1) {
        makeConnection();
        connection.query("UPDATE TBLSTOCKHEAD06 SET ITEMSTOCK06 = ITEMSTOCK06  +'" + user1.addstk + "' WHERE PK_ITEMID06 ='" + user1.itemid + "';"),
            function(err, data) {
                if (err) throw err;
            }

        //connection.end();
        showSupMenu();
    })
}

function placeOrder()

{
    makeConnection();
    inquirer.prompt([{
        type: "input",
        name: "itemid",
        message: "Enter Item ID?"


    }, {
        type: "input",
        name: "qty1",
        required: true,
        message: "Enter Quantity?"

    }]).then(function(user1) {


        connection.query("UPDATE TBLSTOCKHEAD06 SET ITEMSTOCK06=ITEMSTOCK06-" + "'" + user1.qty1 + "'" + "WHERE PK_ITEMID06=" + "'" + user1.itemid + "' and ITEMSTOCK06 >=" + "'" + user1.qty1 + "';"),
            function(err, data) {
                if (err) throw err;
                //console.log(data);
            }

        connection.query("INSERT INTO bamazon.tblordhead04(FK_CUSTID04,ORDITEMID04,ORDQTY04) VALUES ('" + UNAME1 + "','" + user1.itemid + "','" + user1.qty1 + "');"),
            function(err, data) {
                if (err) throw err;

            }

        connection.end();
        showMemberMenu();
        displaystk();

    })
}



//************************************************* Reports 
function salesReport() {

    console.log(UNAME1);
    makeConnection();
    connection.query("call bamazon.SPPOPULARITEMS()", function(err, data) {
        if (err) throw err;
        console.log("\n------------------------------(Sales Report)------------------------------")
        console.log("\nOrder Id   Sale Count        Item Name                Description");
        console.log("--------------------------------------------------------------------------");
        //console.log(data);
        for (var i = 0; i < data[0].length; i++) {


            console.log(data[0][i].ORDITEMID04 + "          " + data[0][i].SALECOUNT + "        " + data[0][i].ITEMNAME06 + "    " + data[0][i].ITEMDESC06);
            console.log("--------------------------------------------------------------------------");
        }



    })
    connection.end();
    if (UNAME1==='SUPERVISOR'){
    		showSupMenu();
    }
 	else
 	{
 			showMemberMenu();

 	}


}

function displaystk() {

    makeConnection();

    connection.query("call bamazon.SPDISPLAYSTOCK();", function(err, data) {
        if (err) throw err;

        console.log("\nItem Id   Item Name     Details       Availability");
        console.log("---------------------------------------------------------");
        for (var i = 0; i < data[0].length; i++) {


            console.log(data[0][i].PK_ITEMID06 + "          " + data[0][i].ITEMNAME06 + "   " + data[0][i].ITEMDESC06.substring(1, 20) + " " + data[0][i].ITEMSTOCK06 + " Left");
            console.log("---------------------------------------------------------");
        }

        //

    })
    connection.end();
}


function showOrderHist(UNAME1) {
    console.log(UNAME1);
    makeConnection();
    connection.query("call bamazon.showOrdHist('" + UNAME1 + "')", function(err, data) {
        if (err) throw err;
        console.log(UNAME1);
        console.log("\nOrder Id   Item Name        Qty                  Amount");
        console.log("---------------------------------------------------------");
        //console.log(data);
        for (var i = 0; i < data[0].length; i++) {


            console.log(data[0][i].PK_ORDID04 + "          " + data[0][i].ITEMNAME06 + "        " + data[0][i].ORDQTY04 + "                   " + data[0][i].AMT);
            console.log("---------------------------------------------------------");
        }


        // 
    })
    connection.end();
    showMemberMenu();
    displaystk();
}



//************************************* Supervisor and Member Menu
function showSupMenu() {
    process.stdout.write('\033c');
    inquirer.prompt([{
        type: "list",
        name: "myChoices1",
        message: "------(MENU)------",
        choices: [
                "SALES REPORT",
                "STOCK REPORT",
                "NEW STOCK",
                "EDIT STOCK",
                "EXIT"
            ] // Menu to Choose Options

    }]).then(function(supuser) {
        switch (supuser.myChoices1) {
            case "SALES REPORT":
                process.stdout.write('\033c');
                console.log("Sales Report...");
                salesReport();
                break;
            case "STOCK REPORT":
                console.log("You Stock Report...");
                displaystk();
                showSupMenu();
                break;
            case "NEW STOCK":
                console.log("New Item Entry...");
                	 	newItemEntry();
                break;
            case "EDIT STOCK":
                console.log("Edit Item...");
                stockEdit();
                break;
            case "EXIT":
                process.stdout.write('\033c');
                console.log(UNAME1 + " You are Logged Out");
                connection.end();
                process.exit();
                //break;
            default:
                showSupMenu();

        }

    })
}
//  ***** Member Menu
function showMemberMenu() {
    process.stdout.write('\033c');
    console.log("Connected as " + UNAME1);
    inquirer.prompt([{
        type: "list",
        name: "myChoices",
        message: "------(MENU)------",
        choices: ["Place Order", 
        "Order History",
        "Customer Favorites",
        "Exit"] 

    }, ]).then(function(user) {

        switch (user.myChoices) {
            case "Place Order":
                process.stdout.write('\033c');
                console.log("Placing Order Now...");
                placeOrder();
                break;
            case "Order History":
                console.log("You Order History...");
                showOrderHist(UNAME1);
                break;
            case "Customer Favorites":
            	salesReport();
            	break;
            case "Exit":
                process.stdout.write('\033c');
                console.log(UNAME1 + " You are Logged Out");
                connection.end();
                process.exit();

        }

    })
}