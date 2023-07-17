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

    var findRecordByEmail=[],findRecordByphoneNumber=[];

    if(email){
        try{
    
            findRecordByEmail = await query(query1);
            //console.log("findRecordByEmail are: ",findRecordByEmail);
        }catch(err){
            console.log(err);
            return res.status(500).json({error:'Internal Server Error'});
        }
    }

    if(phoneNumber){
        try{
            findRecordByphoneNumber = await query(query2);
            //console.log("findRecordByphoneNumber are: ",findRecordByphoneNumber);
        }catch(err){
            console.log(err);
            return res.status(500).json({error:'Internal Server Error'});
        }
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
    else{   
        
        try{
            let query3;
            query3 = `SELECT * FROM contacts WHERE (email = '${email}' AND email IS NOT NULL) OR (phoneNumber = '${phoneNumber}' AND phoneNumber IS NOT NULL);`;

            
            const contacts = await query(query3);
            console.log("Contacts are: ",contacts);
            
            const primaryContacts = contacts.filter(contact => contact.linkPrecedence === "primary");
            const secondaryContacts = contacts.filter(contact => contact.linkPrecedence === "secondary");4
            console.log("Primary Contacts are: ",primaryContacts);
            console.log("Secondary Contacts are: ",secondaryContacts);
            var exactMatchFound=false;

            let primaryContactId,primaryPhoneNumber,primaryEmail;
            let emails = [];
            let phoneNumbers = [];
            let secondaryContactIds = [];

            

            if(primaryContacts.length == 1){
                primaryContactId = primaryContacts[0].id;
                primaryPhoneNumber = primaryContacts[0].phoneNumber;
                primaryEmail = primaryContacts[0].email;
                if(primaryPhoneNumber) phoneNumbers.push(primaryPhoneNumber);
                if(primaryEmail) emails.push(primaryEmail);

                secondaryContacts.forEach(contact => {  
                    if(contact.email === email  && contact.phoneNumber === phoneNumber) exactMatchFound = true;
                    if(contact.email && !emails.includes(contact.email)) emails.push(contact.email);
                    if(contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) phoneNumbers.push(contact.phoneNumber);
                    if(!secondaryContactIds.includes(contact.id)) secondaryContactIds.push(contact.id);
                });

                if(!exactMatchFound){  // Add a new secondary contact.
                    let newContact = {
                        phoneNumber: phoneNumber,
                        email: email,
                        linkedId: primaryContactId,
                        linkPrecedence: 'secondary',
                        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                      };
                      const insertQuery = `INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
                                 VALUES ('${newContact.phoneNumber}', '${newContact.email}', ${newContact.linkedId}, '${newContact.linkPrecedence}', '${newContact.createdAt}', '${newContact.updatedAt}')`;

                    const result = await query(insertQuery);
                    console.log("New secondary data contact is inserted....: ",result);

                    secondaryContactIds.push(result.insertId);
                    if(email && !emails.includes(email)) emails.push(email);
                    if(phoneNumber && !phoneNumbers.includes(phoneNumber)) phoneNumbers.push(phoneNumber);
                }

                const responseData = {
                    "contact":{
                        "primaryContactId":primaryContactId,
                        "emails": emails,
                        "phoneNumbers" : phoneNumbers,
                        "secondaryContactIds" : secondaryContactIds
                    }
                }
                return res.status(200).json(responseData);
            }
            else if(primaryContacts.length == 2){  // To do. The last case.
                query3 = `UPDATE contacts SET linkPrecedence="secondary",linkedId=${primaryContacts[0].id},
                            updatedAt='${new Date().toISOString().slice(0, 19).replace('T', ' ')}' WHERE id=${primaryContacts[1].id}`;
                    console.log(query3);
                    const result = await query(query3);
                    primaryContactId = primaryContacts[0].id;
                    primaryEmail = primaryContacts[0].email;
                    primaryPhoneNumber = primaryContacts[0].phoneNumber;
                    if(primaryPhoneNumber) phoneNumbers.push(primaryPhoneNumber);
                    if(primaryEmail) emails.push(primaryEmail);
                    if(!phoneNumbers.includes(primaryContacts[1].phoneNumber))  phoneNumbers.push(primaryContacts[1].phoneNumber);
                if(!emails.includes(primaryContacts[1].email)) emails.push(primaryContacts[1].email);
                secondaryContactIds.push(primaryContacts[1].id);
                const responseData = {
                    "contact":{
                        "primaryContactId":primaryContactId,
                        "emails": emails,
                        "phoneNumbers" : phoneNumbers,
                        "secondaryContactIds" : secondaryContactIds
                    }
                }
                return res.status(200).json(responseData);

            }else{
                primaryContactId = secondaryContacts[0].linkedId;
                query3 = `SELECT * FROM contacts WHERE id=${primaryContactId}`;
                const primaryObject = await query(query3);
                primaryEmail = primaryObject[0].email;
                primaryPhoneNumber = primaryObject[0].phoneNumber;
                if(primaryPhoneNumber) phoneNumbers.push(primaryPhoneNumber);
                if(primaryEmail) emails.push(primaryEmail);
                
                secondaryContacts.forEach(contact => {  
                    if(contact.email === email  && contact.phoneNumber === phoneNumber) exactMatchFound = true;
                    if(contact.email && !emails.includes(contact.email)) emails.push(contact.email);
                    if(contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) phoneNumbers.push(contact.phoneNumber);
                    if(!secondaryContactIds.includes(contact.id)) secondaryContactIds.push(contact.id);
                });

                if(!exactMatchFound){  // Add a new secondary contact.
                    let newContact = {
                        phoneNumber: phoneNumber,
                        email: email,
                        linkedId: primaryContactId,
                        linkPrecedence: 'secondary',
                        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                      };
                      const insertQuery = `INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt)
                                 VALUES ('${newContact.phoneNumber}', '${newContact.email}', ${newContact.linkedId}, '${newContact.linkPrecedence}', '${newContact.createdAt}', '${newContact.updatedAt}')`;

                    const result = await query(insertQuery);
                    console.log("New secondary data here contact is inserted....: ",result);

                    secondaryContactIds.push(result.insertId);
                    if(email && !emails.includes(email)) emails.push(email);
                    if(phoneNumber && !phoneNumbers.includes(phoneNumber)) phoneNumbers.push(phoneNumber);
                }

                const responseData = {
                    "contact":{
                        "primaryContactId":primaryContactId,
                        "emails": emails,
                        "phoneNumbers" : phoneNumbers,
                        "secondaryContactIds" : secondaryContactIds
                    }
                }
                return res.status(200).json(responseData);
            }    
        }catch(err){
            console.log(err);
            return res.status(500).json({error:'Internal Server Error'});
        }
    }

    return res.status(200).json({message:'Done'});
});

export default router;