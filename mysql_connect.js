const mysql = require('mysql2'); // Only use mysql2
const config = require('./config_sql.js'); // Import config

const con = mysql.createConnection({
  host: config.host,
  user: config.user,       // Use 'user' from config
  password: config.password, // Use 'password' from config
  database: config.database
});

connect();
//used to establish connection with the database
function connect()
{
    con.connect(function(err) 
    {
        if (err) throw err;
        console.log("database Connected!");
    });
}




//register the complaint to the block 
function registercomplaint(values,callback)
{
  sql = ' update block set complaints= ? where block_no = ? and room_no= ?';
  console.log();
  con.query(sql,values,(err,results)=>
  {
      if (err)
      {
          console.log(err);
      }
    callback(err,results);
  })
}

//function to calculate total number of owners
function totalowner(callback)
{
    sql = 'SELECT COUNT(owner_id) FROM owner';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}

//get all the data from the table using table name
function getdata(tablename,callback)
{
    sql = 'select * from '+tablename+';';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}


//add an owner tuple to the table
function createowner(values,callback)
{
    sql = 'insert into owner values(?,?,?,?,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//function to create an owner
function createownerproof(values,callback)
{
    sql = 'insert into identity values(?,?,null);';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}



//book a parking slot for the tenant
function bookslot(values,callback)
{
    sql = 'update room set parking_slot =  ? where room_no = ?';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}



//view all the complaints
function viewcomplaints(callback)
{
    sql = 'select * from oo;';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}




//view only owner complaints
//dbms yuvarraj
function ownercomplaints(ownerid,callback)
{
    sql = 'select complaints,room_no from block where room_no in (select room_no from owner where owner_id in(select id from auth where user_id=?))';
    con.query(sql,ownerid,(err,results)=>
    {
        callback(err,results);
    })
}



//get the total no of tenants
function totaltenant(callback)
{
    sql = 'SELECT COUNT(tenant_id) FROM tenant';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}
//get the total number of employees
function totalemployee(callback)
{
    sql = 'SELECT COUNT(emp_id) FROM employee';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}
//function to retrieve all the complaints in the block
function totalcomplaint(callback)
{
    sql = 'SELECT COUNT(complaints) FROM block';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}
//get the data of tenent
function gettenantdata(tid,callback)
{
    sql = 'select * from tenant where tenant_id in (select id from auth where user_id=?)';
    con.query(sql,tid,(err,results)=>
    {
        callback(err,results);
    })
}




//creating an tenant id
function createtenant(values,callback)
{
    sql = 'insert into tenant values(?,?,?,null,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//creating an proof for tenant
function createtenantproof(values,callback)
{
    sql = 'insert into identity values(?,null,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
function createuserid(values,callback)
{
    sql = 'insert into auth values(?,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}


//owner viewing tenant details
function ownertenantdetails(values,callback)
{
    sql = 'select * from tenant where room_no in (select room_no from owner where owner_id in(select id from auth where user_id=?))';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}

//tenant pays maintanence fee
function paymaintanence(id,callback)
{
    sql = 'update tenant set stat="paid" where tenant_id in (select id from auth where user_id=?)';
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}

//owner viewing room owned by him
function ownerroomdetails(values,callback)
{
    sql = 'select * from room where room_no in (select room_no from owner where owner_id in(select id from auth where user_id=?))';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//view parking alloted for tenant
function viewparking(id,callback)
{
    sql = 'select parking_slot from room where room_no in (select room_no from tenant where tenant_id in (select id from auth where user_id=?))';
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}


//employee salary get 
function empsalary(id,callback)
{
    sql = 'select salary from employee where emp_id in (select id from auth where user_id=?)';
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}



function authoriseuser(username, password, callback) {
    const sql = 'SELECT password FROM auth WHERE user_id = ?';
    const value = [username];

    console.log(value); // Debugging: Check what value is passed into the query

    con.query(sql, value, (err, result) => {
        if (err) {
            console.log("Database query error:", err); // Log the error for debugging
            return callback("Database error", "denied"); // Return a specific error message
        }

        if (!result || result.length === 0) {
            console.log("No user found with username:", username); // Log if no user found
            return callback(null, "denied"); // User not found
        }

        // Directly accessing the password from the result
        const dbPassword = result[0].password; // Assuming the password field is named 'password'

        // Compare the provided password with the one from the database
        if (password === dbPassword) {
            console.log("Password match for user:", username); // Debugging: Log successful login
            return callback(null, "granted"); // Password match
        } else {
            console.log("Incorrect password for user:", username); // Log incorrect password
            return callback(null, "denied"); // Incorrect password
        }
    });
}
// Function for owner to view block details
function ownerblockdetails(ownerId, callback) {
    const sql = 'SELECT * FROM block WHERE room_no IN (SELECT room_no FROM owner WHERE owner_id IN (SELECT id FROM auth WHERE user_id = ?))';
    con.query(sql, [ownerId], (err, results) => {
        if (err) {
            console.log("Error retrieving block details:", err);
            return callback(err, null);
        }
        callback(null, results);
    });
}
// Function to add a new user to the auth table
function adduser(userId, username, password, callback) {
    // SQL query to insert a new user into the 'auth' table
    const sql = 'INSERT INTO auth (user_id, username, password) VALUES (?, ?, ?)';
    
    // Values to be inserted
    const values = [userId, username, password];
    
    // Perform the query
    con.query(sql, values, (err, results) => {
        if (err) {
            console.log("Error adding user:", err);
            return callback(err, null); // Pass error to callback
        }
        callback(null, results); // Pass results to callback
    });
}
const checkRoomExists = (roomno, callback) => {
    const query = 'SELECT * FROM room WHERE room_no = ?';
    con.query(query, [roomno], (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};




module.exports = { 
    checkRoomExists,
    connect,
    con,
    registercomplaint,
    mysql,
    adduser,
    createowner,
    bookslot,
    getdata,
    totalowner,
    totaltenant,
    totalemployee,
    totalcomplaint,
    createownerproof,
    viewcomplaints,
    authoriseuser,
    gettenantdata,
    createtenant,
    createtenantproof,
    ownerroomdetails,
    ownercomplaints,
    viewparking,
    createuserid,
    paymaintanence,
    empsalary,
    ownerroomdetails,
    ownertenantdetails
}