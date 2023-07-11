import express from "express";
import connection from "../mysql/connectDB.js";
import util from 'util';
const query = util.promisify(connection.query).bind(connection);
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({status: 'Welcome to contact routes.'});
})

router.post('/identify', async (req, res) => {
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;

    if(!email && !phoneNumber){
        return res.status(404).json({error:'Phone and email not present/valid'});
    }

    // Check if there exists a record with given email and phoneNumber seperately.
    const query1 = `SELECT * FROM contacts WHERE email = '${email}'`;
    const query2 = `SELECT * FROM contacts WHERE phoneNumber = '${phoneNumber}'`;

    let findRecordByEmail,findRecordByphoneNumber;

    try{

        findRecordByEmail = await query(query1);
        console.log("findRecordByEmail are: ",findRecordByEmail);
    }catch(err){
        console.log(err);
        return res.status(500).json({error:'Internal Server Error'});
    }

    try{
        findRecordByphoneNumber = await query(query2);
        console.log("findRecordByphoneNumber are: ",findRecordByphoneNumber);
    }catch(err){
        console.log(err);
        return res.status(500).json({error:'Internal Server Error'});
    }

      

    //New Entry into the database.
    if(findRecordByEmail.length === 0 && findRecordByphoneNumber.length === 0 ){
        const newContact = {
            phoneNumber: phoneNumber,
            email: email,
            linkedId: null,
            linkPrecedence: 'primary',
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          };
          const insertQuery = `INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
                     VALUES ('${newContact.phoneNumber}', '${newContact.email}', ${newContact.linkedId}, '${newContact.linkPrecedence}', '${newContact.createdAt}', '${newContact.updatedAt}')`;

          try{
                const results = await query(insertQuery);
                console.log("New data contact is inserted....: ",results);
                const responseData = {
                    "contact":{
                        "primaryContactId":results.insertId,
                        "emails": [email],
                        "phoneNumbers" : [phoneNumber],
                        "secondaryContactIds" : []
                    }
                }
                return res.status(200).json(responseData);
          }catch(err){
            console.log(err);
            return res.status(500).json({error:'Internal Server Error'});
          }
    }
    return res.status(200).json({message:'Done'});
});

export default router;