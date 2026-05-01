import express from 'express'
import sqlite3 from 'sqlite3'
import { GoogleGenAI } from "@google/genai"

//node --env-file=.env server.js for .env to be recognized 
const PORT = 3000 //which should be 3000 from .env -> process.env.PORT

//http://localhost:3000

//get express up and going
var app = express()
app.use(express.json())
app.use(express.static('public'))

//database initialization - Im going to test the AUTOINCREMENT feature for most IDs since I don't think they need to be UUIDs, if it goes wrong this comment will be deleted :(
const dbResume = new sqlite3.Database('resume.db', (err)=>{
    if(err){
        console.error("Error opening database:", err.message)
    } 
    else{
        console.log("Connected to resume.db")
        initializeDatabase()
    }
})

//this is just what my personal resume.db tables look like
function initializeDatabase() {
    dbResume.serialize(() => {
        dbResume.run(`CREATE TABLE IF NOT EXISTS tblJobs (
            JID INTEGER PRIMARY KEY AUTOINCREMENT,
            Company TEXT NOT NULL,
            Title TEXT NOT NULL,
            StartDate TEXT,
            EndDate TEXT
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblDetails (
            DID INTEGER PRIMARY KEY AUTOINCREMENT,
            JID INTEGER,
            Descr TEXT NOT NULL,
            FOREIGN KEY (JID) REFERENCES tblJobs(JID) ON DELETE CASCADE
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblSkills (
            SID INTEGER PRIMARY KEY AUTOINCREMENT,
            SkillName TEXT NOT NULL,
            Category TEXT
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblEducation (
            EID INTEGER PRIMARY KEY AUTOINCREMENT,
            Degree TEXT,
            University TEXT,
            State TEXT,
            StartDate TEXT,
            EndDate TEXT
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblAwards (
            AID INTEGER PRIMARY KEY AUTOINCREMENT,
            Title TEXT NOT NULL
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblSettings (
            SetID INTEGER PRIMARY KEY AUTOINCREMENT,
            GeminiKey TEXT
        )`)

        dbResume.run(`CREATE TABLE IF NOT EXISTS tblTarget (
            TID INTEGER PRIMARY KEY AUTOINCREMENT,
            TargetDetails TEXT
        )`)
        dbResume.run(`CREATE TABLE IF NOT EXISTS tblPersonalInfo (
            PID INTEGER PRIMARY KEY AUTOINCREMENT,
            FullName TEXT,
            Phone TEXT,
            Email TEXT,
            Location TEXT,
            Links TEXT
        )`)
    })
}

//revving up the server
app.listen(PORT, () => {
    console.log('Listening on', PORT)
})

/*
    POST ROUTES 
*/
// POST: Add the target job (yeah i added another table)
// I don't actually know if I should even have this table I just did it because I panicked :(
app.post('/api/target', (req, res) => {
    let strTarget = req.body.targetjob.trim()

    dbResume.run("DELETE FROM tblTarget", [], () => { //clear old entry and put in new entry (im only allowing 1 entry at a time for targetjob)
        dbResume.run("INSERT INTO tblTarget (TargetDetails) VALUES (?)", [strTarget], (err,row) => {
            if (err){
                return res.status(500).json({ message: err.message })
            } 

            res.status(200).json({ row })
        })
    })
})

// POST: Add a new Job 
app.post('/api/jobs', (req,res)=>{
    let strCompany = req.body.company.trim()
    let strTitle = req.body.title.trim()
    let strStart = req.body.start.trim()
    let strEnd = req.body.end.trim()

    if(!strCompany || !strTitle)
    {
        return res.status(400).json({message: "User must enter both Company and Title."})
    }

    dbResume.run("INSERT INTO tblJobs (Company, Title, StartDate, EndDate) VALUES (?, ?, ?, ?)", [strCompany, strTitle, strStart, strEnd], (err,row)=>{
        if (err) {
                return res.status(500).json({ "JOB POST ERROR": err.message }) 
            }

            res.status(200).json(row)
    })
})

// POST: Add a new Detail
app.post('/api/details', (req,res)=>{
    let strDescr = req.body.descr.trim()
    let strJID = req.body.jid.trim()

    if(!strDescr || !strJID)
    {
        return res.status(400).json({message: "User must enter both descr and jid."})
    }

    dbResume.run("INSERT into tblDetails (JID, Descr) VALUES (?, ?)", [strJID, strDescr], (err, row)=>{
        if (err) {
                return res.status(500).json({ "DETAIL POST ERROR": err.message }) 
            }

            res.status(200).json(row)       
    })
})

// POST: Add a new Skill
app.post('/api/skills', (req,res)=>{
    let strSkillName = req.body.skillname.trim() 
    let strCategory = req.body.category.trim() 

    if (!strSkillName || !strCategory)
    {
        return res.status(400).json({messge: "Missing either SkillName and or Category"})
    }

    dbResume.run("INSERT INTO tblSkills (SkillName, Category) VALUES (?, ?)", [strSkillName, strCategory], (err,row)=>{
        if (err) {
                return res.status(500).json({ "SKILL POST ERROR": err.message }) 
            }

            res.status(200).json(row)  
    })
})

// POST: Add a new Setting (GeminiKey)
app.post('/api/settings', (req,res)=>{
    let strGeminiKey = req.body.geminikey.trim() 

    if(!strGeminiKey)
    {
        return res.status(400).json({message: "User must enter a GeminiKey"})
    }

    dbResume.run("INSERT INTO tblSettings (GeminiKey) VALUES (?)", [strGeminiKey], (err,row)=>{
        if (err) {
                return res.status(500).json({ "SETTING POST ERROR": err.message }) 
            }

            res.status(200).json(row) 
    })
})

// POST: Add a new Award
app.post('/api/awards', (req,res)=>{
    let strAward = req.body.award.trim()

    if(!strAward)
    {
        return res.status(400).json({message: "User must enter an award title"})
    }

    dbResume.run("INSERT INTO tblAwards (Title) VALUES (?)", [strAward], (err,row)=>{
    if (err) {
            return res.status(500).json({ "AWARDS POST ERROR": err.message }) 
        }

        res.status(200).json(row)  
    })
})

// POST: Add new Education
app.post('/api/education', (req,res)=>{
    let strDegree = req.body.degree.trim()
    let strStart = req.body.start.trim()
    let strEnd = req.body.end.trim()
    let strUniversity = req.body.university.trim()
    let strState = req.body.state.trim()


    const sql = `INSERT INTO tblEducation (Degree, StartDate, EndDate, University, State) 
                 VALUES (?, ?, ?, ?, ?)`
    
    dbResume.run(sql, [strDegree, strStart, strEnd, strUniversity, strState], (err, row) => {
        if (err) {
            return res.status(500).json({ "EDUCATION POST ERROR": err.message })
        }
        
        res.status(200).json(row)
    }) 
})

// POST: Add new Users
app.post('/api/personal-info', (req, res) => {
    let strName = req.body.name.trim()
    let strPhone = req.body.phone.trim()
    let strEmail = req.body.email.trim()
    let strLocation = req.body.location.trim()
    let strLinks = req.body.links.trim()

    // Clear old entry so there is only ever one personal profile
    dbResume.run("DELETE FROM tblPersonalInfo", [], () => { 
        dbResume.run(`INSERT INTO tblPersonalInfo (FullName, Phone, Email, Location, Links) 
                     VALUES (?, ?, ?, ?, ?)`, [strName, strPhone, strEmail, strLocation, strLinks], (err) => {
            if (err){
                return res.status(500).json({ message: err.message })
            } 

            res.status(200).json({ message: "Success" })
        })
    })
})

// POST: AI API Suggestion **BUILT WITH AI INSTRUCTION, SEE DETAILS BELOW:
/*
    Gemini AI was used here from everything below let strPrompt. I specifically had no clue how to approach the
    fetching user-submitted api key part so I asked Gemini how it works, to which it responded with a fetch url statement that
    injected the submitted user key into the ?key= part. As of writing this, I have no clue if this url is legit yet.  

    UPDATE: https://ai.google.dev/gemini-api/docs/text-generation (I just had to rewrite the actual generation part myself thanks Gemini )

*/
app.post('/api/ai/suggest', async (req, res) => {
    let strInput = req.body.strInput  // no trim because we're aiming to grab the whole prompt

    dbResume.get("SELECT GeminiKey FROM tblSettings ORDER BY SetID DESC LIMIT 1", async (err, objRow) => { //grabs latest key specifically 
            if (err || !objRow) {
                return res.status(400).json({ message: "API Key not found." }) 
            }

            try {
                const ai = new GoogleGenAI({ apiKey: objRow.GeminiKey }) //set apiKey to the key stored in latest row of tblSettings
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash', 
                    contents: `You are a professional resume writer. Rewrite the following task into a single, punchy, professional resume bullet point. 
                               Do not provide options or opinions. Do not provide an introduction or explanation. 
                               Just give me the one-sentence result. 

                               Task to rewrite: ${strInput}`
                }) //I had GeminiAI help me clear up my contents because apparently I wasn't clear enough when I just specified 'write this professionally for a resume but like in a bullet point'

                res.status(200).json({ strSuggestion: response.text })
            } catch (objError) {
                res.status(500).json({ strError: "AI Service Failed: " + objError.message }) 
            }
    }) 
}) 

// POST: AI TAILOR FINAL 
app.post('/api/ai/tailor-final', async (req, res) => {
    dbResume.get("SELECT * FROM tblPersonalInfo LIMIT 1", async (err, userInfo) => {
            if (err || !userInfo) {
                return res.status(400).json({ strError: "Personal information not found in database. Please save it first!" })
            }

    const strTargetJob = req.body.targetJob.trim()
    const arrDetails = req.body.details //this is an array, no trimming arrays
    const arrSkills = req.body.skills //this is also an array
    const arrJobs = req.body.jobs //wow! would you look at that, another array...
    const arrAwards = req.body.awards //no way, another array?
    const arrEducation = req.body.education //you'll never guess what this is

    dbResume.get("SELECT GeminiKey FROM tblSettings ORDER BY SetID DESC LIMIT 1", async (err, objRow) => { //grab the latest API key
        if (err || !objRow) {
            return res.status(400).json({ message: "API Key not found in database." })
        }

        try {
            const ai = new GoogleGenAI({apiKey: objRow.GeminiKey}) //access googlegenai with our key

            const response = await ai.models.generateContent({ 
                model: "gemini-2.5-flash",
                contents: `                
                    STRICT COMMAND: You are a resume formatter. 
                        You MUST use the provided data below: 
                        DO NOT invent companies. 
                        DO NOT change the Job Titles (e.g., if it says KFC, keep KFC).
                        Output ONLY the raw HTML content. 
                        DO NOT include Markdown code blocks (like \`\`\`html). 
                        DO NOT include any text before or after the HTML.
                        DO NOT lie. You cannot lie. It is imperative that you do not lie.

                        USER DATA:
                        Name: ${userInfo.FullName}
                        Phone: ${userInfo.Phone}
                        Email: ${userInfo.Email}
                        Location: ${userInfo.Location}
                        Links: ${userInfo.Links}
                        Target Job: ${strTargetJob}
                        Selected Jobs: ${arrJobs.join(', ')}
                        Selected Experience: ${arrDetails.join(' | ')}
                        Selected Skills: ${arrSkills.join(', ')}
                        Selected Awards/Certs: ${arrAwards.join(', ')}
                        Selected Education: ${arrEducation.join(', ')}
                        
                        TASK: 
                        1. Organize the 'Selected Experience', 'Selected Jobs', 'Selected Awards/Certs', 'Selected Education', and 'Selected Skills' into a resume tailored to 'Target Job'.
                        2. Improve the grammar and professional tone of the bullets, but keep the facts true.
                        3. Output the result in clean HTML format using Bootstrap 5 classes.
                        4. Provide a brief resume summary at the top of the resume preview.
                           Keep this to 3-4 sentences. Tailor this summary specifically to the targetted job
                           by highlighting how the selected user data applies to that targetted job. 
                        5. When listing out 'Selected Skills', 'Selected Awards/Certs', and 'Selected Experience, list them with bullet points.
                        6. Make sure to include the start and end dates for every 'Selected Jobs' and 'Selected Education'. 
                        7.) Return the raw HTML for the interior of a resume card only.
                        8.) Place the resume in a white card of its own, make it look like A4 paper.
                        9.) You MUST include these specific H3 headers with a <hr> (horizontal rule) under each: 
                            - Summary
                            - Experience
                            - Skills
                            - Awards & Certifications
                            - Education
                        
            `
            }) //once again, I am using gemini AI to spawn in a valid prompt because my prompt resulted in a sketchy response that just lied about everything in the resume preview. 

            res.status(200).json({ strSuggestion: response.text })
        } catch (error) {
            console.error("AI Route Error:", error)
            res.status(500).json({ strError: "AI Service Failed: " + error.message }) 
        }
    })
})
})
/*

    GET ROUTES 

*/
// GET: Get the target job
app.get('/api/target', (req, res) => {
    dbResume.get("SELECT TargetDetails FROM tblTarget LIMIT 1", (err, row) => {
        if (err)
        {
            return res.status(500).json({ message: err.message })
        }
        res.status(200).json(row)
    })
})

// GET: Get all jobs
app.get('/api/jobs', (req,res)=>{
    dbResume.all("SELECT * FROM tblJobs", (err,rows)=>{
        if(err)
        {
            res.status(500).json({outcome: "Job get error", message: err.message})
        }
        
        res.status(200).json(rows)
        
    })
})

// GET: Get details, requires a valid JID to access corresponding details 
app.get('/api/details', (req,res)=>{
    let strJID = req.query.jid.trim()

    if (!strJID) {
        return res.status(400).json({ message: "JID is required" }) 
    }

    dbResume.all("SELECT * FROM tblDetails WHERE JID = ?", [strJID], (err, row)=>{
        if (err) 
        {
            return res.status(500).json({ message: err.message })
        }

        res.status(200).json(row) 
    })

})

// GET: Get all skills
app.get('/api/skills', (req, res) => {
    dbResume.all("SELECT * FROM tblSkills", (err, row) => {
        if (err)
            {
                return res.status(500).json({ message: err.message }) 
            } 
        res.status(200).json(row) 
    })
})

// GET: Get all settings (API key)
app.get('/api/settings', (req, res) => {
    dbResume.get("SELECT GeminiKey FROM tblSettings ORDER BY SetID DESC LIMIT 1", (err, row) => {
        if (err)
            {
                return res.status(500).json({ message: err.message }) 
            } 

        res.status(200).json(row) 
    }) 
}) 

// GET: Get all awards
app.get('/api/awards', (req, res) => {
    dbResume.all("SELECT * FROM tblAwards", (err, row) => {
        if (err)
            {
                return res.status(500).json({ message: err.message }) 
            } 

        res.status(200).json(row) 
    }) 
})

// GET: Get all Education
app.get('/api/education', (req,res)=>{
    dbResume.all("SELECT * FROM tblEducation", (err,row)=>{
        if (err){
            return res.status(500).json({ message: err.message }) 
        }

        res.status(200).json(row) 
    })
})

/*

    DELETE ROUTES

*/
// DELETE: Delete a Job (requires JID)
app.delete('/api/jobs/:jid', (req, res) => {
    let strJID = req.params.jid.trim()

    if (!strJID) 
    {
        return res.status(400).json({ message: "Missing JID" })
    }


    dbResume.run("DELETE FROM tblJobs WHERE JID = ?", [strJID], (err,row) => {
        if (err) {
            return res.status(500).json({ message: err.message })
        }
            
        res.status(200).json(row)
    })
})

// DELETE: Delete a Skill (requires SID)
app.delete('/api/skills/:sid', (req, res) => {
    let strSID = req.params.sid.trim()

    if (!strSID) 
    {
        return res.status(400).json({ message: "Missing SID" })
    }

    dbResume.run("DELETE FROM tblSkills WHERE SID = ?", [strSID], (err,row) => {
        if (err) 
        {
            return res.status(500).json({ message: err.message })
        }

        res.status(200).json(row)
    })
})




