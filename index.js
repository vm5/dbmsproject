const express = require("express");
const bodyParser = require('body-parser');
const db = require('./mysql_connect');
const dashB = require('./routes/dashb');
const cors = require("cors")


//port number to listen
const port = 5000;

//init
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/dashboard",dashB);
app.use(cors())


//initializing
app.listen(port,()=>{
  console.log(`Server started running on ${port}`);
}); 


//home page 
app.get('/', function(req, res){
  res.send("Welcome to SNN Raj Serenity!");
});

app.get('/usercount', (req, res) => {
  const query = 'CALL GetUserCount()'; 
  
  db.con.query(query, (err, result) => {
      if (err) {
          console.error('Error executing stored procedure:', err.message);
          return res.status(500).send({ message: 'Error fetching user count' });
      }

      // The result is returned as an array, with the first index containing the result of the query.
      const userCount = result[0][0].user_count; 
      res.status(200).send({ userCount }); // Send user count as a response
  });
});


//authorisation
app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let rep = "unknown";
  let acces = "denied";

  if(username &&
    username.toUpperCase().charAt(0) === "E" &&
    password &&
    password.length >= 6){
      rep = "employee";

      // res.send({ user: "employee" });
    }else if (
    username &&
    username.toUpperCase().charAt(0) === "A" &&
    password &&
    password.length >= 6
  ) {
    rep = "admin";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "T" &&
    password &&
    password.length >= 6
  ) {
    rep = "tenant";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "O" &&
    password &&
    password.length >= 6
  ) {
    rep= "owner";
  }  else if(password.length < 6) {
    res.send({ user: "passunknown" });
  }else {
    res.send({ user: "unknown" });
  }

  const resul =db.authoriseuser(username,password,(err,result)=>{
    if(err) console.log(err);
    acces = result;
    console.log(acces);
    res.send({
      access: acces,
      user: rep,
    });
  })
});


//register complaint
app.post('/raisingcomplaint',function(req,res){
    const desc = req.body.descp;
    const blockno = req.body.blockno;
    const roomno = req.body.roomno;
    const values = [desc,blockno,roomno];
    const resul =db.registercomplaint(values,(err,result)=>{
      if(err) console.log(err);
    res.send(result);
    })
});
app.post('/createtenant', function(req, res) {
  const name = req.body.name;
  const age = req.body.age;
  const tenantno = req.body.tenantno;
  const adhaar = req.body.adhaar;
  const roomno = req.body.roomno;
  const password = req.body.password;
  const dob = req.body.dob;

  // Check if the room exists before inserting the tenant
  db.con.query('SELECT * FROM room WHERE room_no = ?', [roomno], function(err, result) {
    if (err) {
      console.error('Error checking room:', err.message);
      return res.status(500).send({ message: 'Internal server error while checking room.' });
    }

    if (result.length === 0) {
      // Room doesn't exist
      return res.status(400).send({ message: 'Room number does not exist.' });
    }

    // Proceed with tenant insertion if room exists
    const values = [tenantno, name, dob, roomno, age];

    // Insert tenant details
    db.createtenant(values, (err, result) => {
      if (err) {
        console.error('Error inserting tenant:', err.message);
        return res.status(400).send({ message: err.message });
      }

      // Insert tenant proof
      const prof = [adhaar, tenantno];
      db.createtenantproof(prof, (err, result) => {
        if (err) {
          console.error('Error inserting tenant proof:', err.message);
          return res.status(400).send({ message: err.message });
        }

        // Create user in auth table
        const vals = ["t-" + tenantno, password, tenantno];
        db.createuserid(vals, (err, result) => {
          if (err) {
            console.error('Error creating user ID:', err.message);
            return res.status(400).send({ message: err.message });
          } else {
            return res.status(200).send({ message: 'Tenant created successfully.' });
          }
        });
      });
    });
  });
});



app.post('/createowner', (req, res) => {
  const ownerid = req.body.ownerId;
  const name = req.body.name;
  const age = req.body.age;
  const aggrement_status = req.body.aggrementStatus;
  const roomno = req.body.roomno;
  const dob = req.body.dob;
  const proof = req.body.adhaar;
  const password = req.body.password;

  // Check if the room_no exists in the room table before proceeding
  db.checkRoomExists(roomno, (err, result) => {
      if (err) {
          console.error('Error checking room:', err.message);
          return res.status(500).send({ message: 'Internal server error.' });
      }

      if (result.length === 0) {
          // Room doesn't exist
          return res.status(400).send({ message: 'Room number does not exist.' });
      }

      // Proceed with creating the owner if room exists
      const values = [ownerid, name, age, aggrement_status, roomno, dob];
      const proofval = [proof, ownerid];
      const vals = ["o-" + ownerid, password, ownerid];

      // Insert owner details
      db.createowner(values, (err, result) => {
          if (err) {
              console.error('Error inserting owner:', err.message);
              return res.status(400).send({ message: err.message });
          }

          // Insert owner proof
          db.createownerproof(proofval, (err, result) => {
              if (err) {
                  console.error('Error inserting owner proof:', err.message);
                  return res.status(400).send({ message: err.message });
              }

              // Create user in auth table
              db.createuserid(vals, (err, result) => {
                  if (err) {
                      console.error('Error creating user ID:', err.message);
                      return res.status(400).send({ message: err.message });
                  } else {
                      return res.status(200).send({ message: 'Owner created successfully.' });
                  }
              });
          });
      });
  });
});




//get the tenent details fetch all data from table
app.get('/tenantdetails',(req,res)=>
{
    const rest = db.getdata('tenant',(err,result)=>
    {
      res.send(result);
    })
})



//get the owner details fetch all the data from the table
app.get('/ownerdetails',(req,res)=>
{
    const rest = db.getdata('owner',(err,result)=>
    {
      res.send(result);
    })
})

//view parkings owned by tenant
app.post('/viewparking',(req,res)=>
{
  const id = req.body.userId;
  const rest = db.viewparking(id,(err,result)=>
  {
    if(err) console.log(err);
    res.send(result);
  })
})



//get the room details owned by the owner
app.post('/ownercomplaints',(req,res)=>
{
  const ownerid = req.body.userId;
    const rest = db.ownercomplaints(ownerid,(err,result)=>
    {
      if(err) console.log(err);
      res.send(result);
    })
})


//view complaints that are in the database
app.get('/viewcomplaints',(req,res)=>
{
    const rest = db.viewcomplaints((err,result)=>
    {
      res.send(result);
    })
})
app.get('/adminblockdetails', (req, res) => {
  const query = `
      SELECT admin_name, 
             (SELECT block_name FROM block WHERE block.block_no = block_admin.block_no) AS block_name
      FROM block_admin;
  `;

  // Use 'con' instead of 'db' if that's your database connection object
  db.con.query(query, (err, result) => {
      if (err) {
          console.error("Error executing the query:", err);
          res.status(500).send("An error occurred while fetching data.");
      } else {
          res.json(result);
      }
  });
});
app.get('/employeesupervisors', (req, res) => {
  const query = `
    SELECT 
      e.emp_id,
      e.emp_name AS employee_name,
      e.salary,
      e.emp_type,
      s.emp_name AS supervisor_name
    FROM 
      employee e
    LEFT JOIN 
      employee s ON e.supervisor_id = s.emp_id;
  `;

  db.con.query(query, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).send("An error occurred while fetching data.");
    } else {
      res.json(result);
    }
  });
});

// In your Express server file
app.get('/averageownerage', (req, res) => {
  const query = `
    SELECT 
      aggrement_status,
      AVG(age) AS average_age
    FROM 
      owner
    GROUP BY 
      aggrement_status;
  `;

  db.con.query(query, (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("An error occurred while fetching data.");
    } else {
      res.json(result);
    }
  });
});


//getonlycomplaints according to owner
app.post('/ownerroomdetails',(req,res)=>
{
    const ownerId = req.body.userId;
    const rest = db.ownerroomdetails(ownerId,(err,result)=>
    {
      if(err) console.log(err);
      res.send(result);
    })
})




//books parking slot for tenents
app.post('/bookslot',(req,res)=>
{
    const roomno =req.body.roomNo;
    const slno = req.body.slotNo;
    const values = [slno,roomno,];
    const rest = db.bookslot(values,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      else{
        res.sendStatus(200);
      }
      
  })
});


app.post('/ownertenantdetails',(req,res)=>
{
    const id = req.body.userId;
    const rest = db.ownertenantdetails(id,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      else{
        res.send(result);
      }
  })
});

app.post('/paymaintanance',(req,res)=>
{
    const id = req.body.userId;
    const rest = db.paymaintanence(id,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      else{
        res.sendStatus(200);
      }
  })
});
//Other routes
app.get('*', function(req, res){
  res.send('Sorry, this is an invalid URL.');
});