var express = require('express');
const app = express();
var fileupload = require('express-fileupload');
app.use(fileupload({
    useTempFiles:true
}));

var cloudinary = require('cloudinary').v2;


cloudinary.config({
        cloud_name:'henno-nwu',
        api_key: '546927484354822',
        api_secret: 'uySz8FOlgWF7fYXGoIJokuQA69U'   
});

app.get('/',(req,res,next)=>{
    res.status(200).send('hello world');
});


app.post('/upload', function(req,res,next){
    //console.log(req.files);
    const file = req.files.txt;
    console.log(file);
    cloudinary.uploader.upload(file.tempFilePath,{resource_type: "auto"},function(err, result){
        
        console.log("Error: ", err);
        console.log("Result: ", result);
    });
    
})



const router = express.Router();
const emailValidator = require("email-validator");
const xlsx = require("xlsx");
const mysql = require('mysql');
const papa = require('papaparse');
const idValidator = require('validator-sa');

app.post('/classify', function (req, res) {
    let uploadFail, wrongFile, classifyFail, queryError = false;
    if (!req.files || Object.keys(req.files).length === 0) {
        uploadFail = true;
        return res.send('upload failed', {
            uploadFail: uploadFail
        });
    } else {
        // Here I obtain meta data regarding the file such as the full filename, filetype, and partial filename
        let fileFullName = req.files.txt.name;
        let nameSplit = fileFullName.split(".");
        let filetype = nameSplit.pop();
        let fileName = nameSplit.shift();
        let classifyResult, writeMetaResult;
        if (filetype == 'txt') {
            // The NPM package Papa Parse is used to parse .txt files using a CSV format into a JSON object which acts as an interface for classify()
            try {
                parsedFile = papa.parse(req.files.txt.data.toString('utf8'), {
                    header: true
                });
                delete parsedFile.meta;
                delete parsedFile.errors;
                classifyResult = classify(parsedFile);
                if (classifyResult == false) {
                    classifyFail = true;
                    return res.send('failed', {
                        classifyFail: classifyFail
                    });
                } else {
                    writeMetaResult = writeMeta(filetype, fileName, classifyResult)
                    if (writeMetaResult) {
                        res.send('success');
                    } else {
                        queryError = true;
                        res.send('failed', {
                            queryError: queryError
                        });
                    }
                }
            } catch (e) {
                console.log(e.name + ': ' + e.message + '\n\n\n' + e.stack);
                classifyFail = true;
                return res.send('failed', {
                    classifyFail: classifyFail
                });
            }
        } else if (filetype == 'xlsx') {
            // The NPM package xlsx is used to parse an xlsx file into a JSON object, with some extra tweaking
            let data = xlsx.read(req.files.txt.data);
            let sheetName = data.SheetNames[0];
            let parsedData = xlsx.utils.sheet_to_json(data.Sheets[sheetName]);
            let formattedData = {
                "data": parsedData
            };
            classifyResult = classify(formattedData);
            if (classifyResult == false) {
                classifyFail = true;
                return res.send('failed', {
                    classifyFail: classifyFail
                });
            } else {
                writeMetaResult = writeMeta(filetype, fileName, classifyResult)
                if (writeMetaResult) {
                    res.send('success');
                } else {
                    queryError = true;
                    res.send('failed', {
                        queryError: queryError
                    });
                }
            }
        } else if (filetype == 'json') {
            classifyResult = classify(JSON.parse(req.files.txt.data.toString('utf8')));
            if (classifyResult == false) {
                classifyFail = true;
                return res.send('failed', {
                    classifyFail: classifyFail
                });
            } else {
                writeMetaResult = writeMeta(filetype, fileName, classifyResult)
                if (writeMetaResult) {
                    res.send('success');
                } else {
                    queryError = true;
                    res.send('failed', {
                        queryError: queryError
                    });
                }
            }
        } else {
            wrongFile = true;
            res.send('failed', {
                wrongFile: wrongFile
            });
        }
    }
});







// Loops through a JSON object to classify fields as 'Protected' or 'Unprotected'
function classify(json) {
    let favouriteSnackIsProtected, idIsProtected, firstNameIsProtected, lastNameIsProtected, emailIsProtected, cellphoneIsProtected, genderIsProtected, ethnicityIsProtected, religionIsProtected = 'Unprotected';
    // Arrays for classifying gender, religion, and ethnicity
    const genders = ['Male', 'Female', 'Other', 'Undisclosed', 'Refused'];
    const religions = ['Christianity', 'Islam', 'Other', 'Undisclosed', 'Hinduism', 'Taoism', 'Buddhism', 'Judaism', 'African traditional belief', 'Confucian', 'Baha\'is', 'No religion', 'Refused'];
    const ethnicities = ['Black', 'White', 'Coloured', 'Indian/Asian', 'Other', 'Unspecified'];

    try {
        for (let i = 0; i < Object.keys(json.data).length; i++) {
            if (json.data[i].national_id != null || json.data[i].national_id != undefined) {
                // Calls validator-sa's isValidSouthAfricanIDNumber() function on the national_id field and removes any empty spaces using regex I added
                if (idValidator.isValidSouthAfricanIDNumber(json.data[i].national_id.replace(/\s/g, ''))) {
                    idIsProtected = 'Protected';
                } else {
                    idIsProtected = 'Unprotected';
                }
            } else {
                idIsProtected = 'Unprotected';
            }

            firstNameIsProtected = 'Unprotected';
            lastNameIsProtected = 'Unprotected';
            favouriteSnackIsProtected = 'Unprotected';

            if (json.data[i].email_address != null || json.data[i].email_address != undefined) {
                // Calls email-validator's validate() function on the email_address field
                if (emailValidator.validate(json.data[i].email_address)) {
                    emailIsProtected = 'Protected';
                } else {
                    emailIsProtected = 'Unprotected';
                }
            } else {
                emailIsProtected = 'Unprotected';
            }

            if (json.data[i].cellphone_number != null || json.data[i].cellphone_number != undefined) {
                // Replaces +27 with a 0 if present and removes any empty spaces
                let trimmed = json.data[i].cellphone_number.replace('+27', '0').replace(/\s/g, '');
                let numberRegex = /^0(6|7|8){1}[0-9]{1}[0-9]{7}$/;

                // Tests whether the cellphone number is valid using regex I wrote for South African mobile numbers
                if (numberRegex.test(trimmed) === true) {
                    cellphoneIsProtected = 'Protected';
                } else {
                    cellphoneIsProtected = 'Unprotected';
                }
            } else {
                cellphoneIsProtected = 'Unprotected';
            }

            // Gender test
            if (json.data[i].gender != null || json.data[i].gender != undefined) {
                for (k = 0; k < genders.length; k++) {
                    if (json.data[i].gender.toUpperCase() == genders[k].toUpperCase()) {
                        genderIsProtected = 'Protected'
                        break;
                    } else {
                        genderIsProtected = 'Unprotected';
                    }
                }
            } else {
                genderIsProtected = 'Unprotected';
            }

            // Ethnicity test
            if (json.data[i].ethnicity != null || json.data[i].ethnicity != undefined) {
                for (q = 0; q < ethnicities.length; q++) {
                    if (json.data[i].ethnicity.toUpperCase() == ethnicities[q].toUpperCase()) {
                        ethnicityIsProtected = 'Protected'
                        break;
                    } else {
                        ethnicityIsProtected = 'Unprotected';
                    }
                }
            } else {
                ethnicityIsProtected = 'Unprotected';
            }

            // Religion test
            if (json.data[i].religion != null || json.data[i].religion != undefined) {
                for (z = 0; z < religions.length; z++) {
                    if (json.data[i].religion.toUpperCase() == religions[z].toUpperCase()) {
                        religionIsProtected = 'Protected'
                        break;
                    } else {
                        religionIsProtected = 'Unprotected';
                    }
                }
            }

            // Rewrites all fields as either Protected or Unprotected
            json.data[i].national_id = idIsProtected;
            json.data[i].first_name = firstNameIsProtected;
            json.data[i].last_name = lastNameIsProtected;
            json.data[i].email_address = emailIsProtected;
            json.data[i].cellphone_number = cellphoneIsProtected;
            json.data[i].gender = genderIsProtected;
            json.data[i].ethnicity = ethnicityIsProtected;
            json.data[i].religion = religionIsProtected;
            json.data[i].favourite_snack = favouriteSnackIsProtected;
        }
        return json;
    } catch (e) {
        console.log(e.name + ': ' + e.message);
        return false;
    }
}

// Writes the meta data from the JSON object obtained from Classify() to the meta table in my database
function writeMeta(fileType, fileName, json) {
    try {
        connection = mysql.createConnection({
            mysql:'//doadmin:h8xndq2svwyg3llu@db-mysql-fra1-85473-do-user-8350589-0.b.db.ondigitalocean.com:25060/defaultdb?',
            
            
        });
        connection.connect(function (e) {
            if (e) {
                console.error(e.name + ': ' + e.message + '\n\n\n' + e.stack);
            }
        });
        // I needed to obtain both the keys and values in the JSON object to correctly write to the meta table
        try {
            json.data.forEach((item, index) => {
                for (key in item) { //key is your field_name
                    value = item[key]; //value is your actual field value for field_name;
                    let sql = "INSERT INTO meta (datastore_name, datastore_type, field_name, category) VALUES ('" + fileName + "', '" + fileType + "', '" + key + "', '" + value + "')";
                    connection.query(sql, function (result) {
                        console.log('Inserted: ' + key + ' ' + value);
                    });
                }
            })
            return true;
        } finally {
            connection.end();
        }
    } catch (e) {
        console.log(e.name + ': ' + e.message + '\n\n\n' + e.stack);
        return false;
    }
}


module.exports = router;










app.listen(3000, ()=>{
    console.log("starting at port 3000");
});