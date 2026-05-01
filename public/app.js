// Global arrays to hold our local state
let arrJobs = []

//AI-SPAWNED: Uses the AI generated functions below. 
document.addEventListener('DOMContentLoaded', () => {
    refreshUI() // Initial load of all data
    populateJobDropdown() //Shows existing jobs from db
})
/*

    QUILL WRESTLING (btnSaveDetail)

*/
const objQuillEditor = new Quill('#divQuillContainer', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }]
        ]
    }
})

//btnSaveDetail
document.querySelector('#btnSaveDetail').addEventListener('click', async()=>{
    let strJID = document.querySelector('#selJob').value.trim()
    let strDescr = objQuillEditor.root.innerHTML

    if (!strDescr || strDescr === '') { 
        alert("Please enter a detail.")
        return
    }

    let objRes = await fetch('/api/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: strJID, descr: strDescr })
    })

    if (objRes.ok) {
        refreshUI()
        objQuillEditor.setContents([]) // Clear text area for reuse
    }
})

/*

    SAVE BUTTONS (Key, Job, Awards)

*/
//btnSaveKey
document.querySelector('#btnSaveKey').addEventListener('click', async()=>{
    let strKey = document.querySelector('#strGeminiKey').value.trim()

    let objRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminikey: strKey })
    })
    
    if (objRes.ok) {
        alert("Key saved successfully!")
    }
})

//btnSaveTarget
document.querySelector('#btnSaveTarget').addEventListener('click', async () => {
    let strTarget = document.querySelector('#txtTargetJob').value.trim()

    let objRes = await fetch('/api/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetjob: strTarget })
    })

    if (objRes.ok) {
        alert("Target job context saved to database.")
    }
})

//btnSaveJob
document.querySelector('#btnSaveJob').addEventListener('click', async()=>{
    let strCompany = document.querySelector('#strCompany').value.trim()
    let strTitle = document.querySelector('#strTitle').value.trim()
    let strStartDate = document.querySelector('#strStartDate').value.trim()
    let strEndDate = document.querySelector('#strEndDate').value.trim()

    let objRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: strCompany, title: strTitle, start: strStartDate, end: strEndDate })
    })

    if (objRes.ok) {
        refreshUI() 
        populateJobDropdown() // update the select menu for details section
    }
})

//btnSaveSkill
document.querySelector('#btnSaveSkill').addEventListener('click', async()=>{
    let strSkillName = document.querySelector('#strSkillName').value.trim()
    let strCategory = document.querySelector('#strCategory').value.trim()

    let objRes = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillname: strSkillName, category: strCategory })
    })

    if (objRes.ok){
        refreshUI()
    }

})

//btnSaveCert
document.querySelector('#btnSaveCert').addEventListener('click', async()=>{
    let strCertName = document.querySelector('#strCertName').value.trim()

    let objRes = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ award: strCertName })
    })

    if (objRes.ok) {
        refreshUI()
    }
})

//btnSaveEd
document.querySelector('#btnSaveEd').addEventListener('click', async()=>{
    let strDegree = document.querySelector('#strDegree').value.trim()
    let strUniversity = document.querySelector('#strUniversity').value.trim()
    let strEdState = document.querySelector('#strEdState').value.trim()
    let strEdStart = document.querySelector('#strEdStart').value.trim()
    let strEdEnd = document.querySelector('#strEdEnd').value.trim()

    let objRes = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({degree: strDegree, university: strUniversity, start: strEdStart, end: strEdEnd, state: strEdState})
    })

    if (objRes.ok) {
        refreshUI()
    }
})

document.querySelector('#btnSaveInfo').addEventListener('click', async () => {
    const strName = document.querySelector('#strUserName').value.trim()
    const strPhone = document.querySelector('#strUserPhone').value.trim()
    const strEmail = document.querySelector('#strUserEmail').value.trim()
    const strLoc = document.querySelector('#strUserLoc').value.trim()
    const strLinks = document.querySelector('#strUserLinks').value.trim()

    if (!strName || !strEmail) {
        alert("Name and Email are required!")
        return
    }

    const objRes = await fetch('/api/personal-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({name: strName, phone: strPhone, email: strEmail, location: strLoc, links: strLinks })
    })

    if (objRes.ok) {
        alert("Personal information saved successfully!")
    }
})
/*

    Wrestling with the AI stuff

*/
//btnGetAI
document.querySelector('#btnGetAI').addEventListener('click', async()=>{
    let strInput = objQuillEditor.getText().trim() //grab the plain text from the quill editor and store into strInput

    if (!strInput)
    {
        return alert("Enter a detail first!")
    } 

    let objRes = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({strInput: strInput })
    })

    let objData = await objRes.json()

    if (objRes.ok) {
        let strSuggestPara = document.querySelector('#txtAISuggestion')
        strSuggestPara.innerText = objData.strSuggestion //suggestion paragraph gets filled with the AI suggestion

        document.querySelector('#divAISuggestion').classList.remove('d-none') //show suggestion box
    }
    else{
        console.error("AI Error:", objData.strError)
    }
})

//btnUseAi
document.querySelector('#btnUseAI').addEventListener('click', () => {
    // grab the text from the suggestion paragraph
    const strAiText = document.querySelector('#txtAISuggestion').innerText //text from suggested para

    //replaces the user text with the ai text
    objQuillEditor.setContents([
        { insert: strAiText }
    ])

    document.querySelector('#divAISuggestion').classList.add('d-none') //hide suggestion box after use
})

//btnGenerateResume -> AI-ASSISTED 
document.querySelector('#btnGenerateResume').addEventListener('click', async()=>{
    const resPreview = document.querySelector('#sectionPreview') 
    const strTarget = document.querySelector('#txtTargetJob').value.trim()
    
    // Gather all checked content
    /*
        Check-specific query selector: https://stackoverflow.com/questions/66013541/how-to-document-queryselectorall-only-checked-items

        Used Gemini AI and asked how to map the checked details and skills since just adding .map(el -> el.value) didn't work.

        It seems like the content grabbed from document.querySelectorAll('.chk-resume-detail:checked') for example returns as a NodeList,
        which is incompatible with the .map() function. From what I can tell, Array.from then turns the NodeList into a valid array before
        mapping. 
    */

    const strName = document.querySelector('#strUserName').value.trim()
    const strPhone = document.querySelector('#strUserPhone').value.trim()
    const strEmail = document.querySelector('#strUserEmail').value.trim()
    const strLoc = document.querySelector('#strUserLoc').value.trim()
    const strLinks = document.querySelector('#strUserLinks').value.trim()
        
    const arrSelectedJobs = Array.from(document.querySelectorAll('.chk-resume-job:checked')).map(el =>{
        const jobID = el.value // The checkbox value is the JID
        const jobObj = arrJobs.find(j => j.JID == jobID) // Find the job in our global array
        return `${jobObj.Company} (${jobObj.Title}): ${jobObj.StartDate} to ${jobObj.EndDate || 'Present'}`
    })
    const arrSelectedDetails = Array.from(document.querySelectorAll('.chk-resume-detail:checked')).map(el => el.value)
    const arrSelectedSkills = Array.from(document.querySelectorAll('.chk-resume-skill:checked')).map(el => el.value)
    const arrSelectedAwards = Array.from(document.querySelectorAll('.chk-resume-award:checked')).map(el => el.value)
    const arrSelectedEducation = Array.from(document.querySelectorAll('.chk-resume-ed:checked')).map(el => el.value)

    // cool little spin borders: https://getbootstrap.com/docs/4.2/components/spinners/
    resPreview.innerHTML = '<div class="text-center p-5"><div class="spinner-border"></div><p>AI is tailoring your resume...</p></div>'

    const objRes = await fetch('/api/ai/tailor-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userName: strName,
            userPhone: strPhone,
            userEmail: strEmail,
            userLoc: strLoc,
            userLinks: strLinks,
            targetJob: strTarget,
            details: arrSelectedDetails,
            skills: arrSelectedSkills,
            jobs: arrSelectedJobs,
            awards: arrSelectedAwards,
            education: arrSelectedEducation
        })
    })

    const objData = await objRes.json()
        if (objRes.ok) {
            let suggestHtml = objData.strSuggestion //html format grabs the stuff suggested by ai

            resPreview.innerHTML = suggestHtml //html is displayed on preview, replaces the spinner
            resPreview.scrollIntoView({ behavior: 'smooth' }) //auto scrolls down to the preview
        } else {
            resPreview.innerHTML = `<p>Error: ${objData.strError}</p>`
        }
})


/*

    UI-RELATED FUNCTIONS (HEAVILY USED GEMINI AI)

*/
/*

    AI-Generated Function that aids in refreshing the UI after most btnSaves for the sake of quickly populating
    the Select Items for Resume section. Creates separate boxes where Jobs are grouped with their respective Details, 
    a separate box containing the list of inserted skills, and another box containing the list of inserted certificates. 

*/
async function refreshUI() {
    const elDisplay = document.getElementById('divDisplayArea')
    // Clear display and set base structure
    elDisplay.innerHTML = '<h2 class="h4 mt-4" id="resume-builder-heading">Select Items for Resume</h2>'

    // --- 1. JOBS & DETAILS ---
    const objJobRes = await fetch('/api/jobs')
    const arrJobsData = await objJobRes.json() // API now returns array directly
    arrJobs = arrJobsData 

    for (const objJob of arrJobs) {
        const elJobDiv = document.createElement('div')
        elJobDiv.className = "p-3 border rounded mb-3 bg-white shadow-sm"
        elJobDiv.innerHTML = `
            <div class="form-check">
                <input class="form-check-input chk-resume-job" type="checkbox" value="${objJob.JID}" id="job${objJob.JID}" aria-label="Include ${objJob.Company} job">
                <label class="form-check-label fw-bold" for="job${objJob.JID}">${objJob.Company} - ${objJob.Title}</label>
            </div>
            <div id="detailsFor${objJob.JID}" class="ms-4 mt-2"></div>
        `
        elDisplay.appendChild(elJobDiv)
        await fetchAndRenderDetails(objJob.JID)
    }

    // --- 2. EDUCATION ---
    const objEdRes = await fetch('/api/education')
    const arrEd = await objEdRes.json()
    
    if (arrEd.length > 0) {
        const elEdSection = document.createElement('div')
        elEdSection.className = "mt-4 p-3 border rounded bg-white shadow-sm"
        elEdSection.innerHTML = '<h3 class="h6 border-bottom pb-2">Education</h3>'
        
        arrEd.forEach(obj => {
            const edStr = `${obj.Degree} from ${obj.University}, ${obj.State} (${obj.StartDate} - ${obj.EndDate || 'Present'})`
            elEdSection.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input chk-resume-ed" type="checkbox" value="${edStr}" id="ed${obj.EID || obj.id}">
                    <label class="form-check-label" for="ed${obj.EID || obj.id}">${edStr}</label>
                </div>
            `
        })
        elDisplay.appendChild(elEdSection)
    }

    // --- 3. SKILLS ---
    const objSkillRes = await fetch('/api/skills')
    const arrSkills = await objSkillRes.json()
    
    if (arrSkills.length > 0) {
        const elSkillSection = document.createElement('div')
        elSkillSection.className = "mt-4 p-3 border rounded bg-white"
        elSkillSection.innerHTML = '<h3 class="h6 border-bottom pb-2">Skills</h3>'
        
        arrSkills.forEach(objSkill => {
            elSkillSection.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input chk-resume-skill" type="checkbox" value="${objSkill.SkillName}" id="skill${objSkill.SID}" aria-label="Include skill ${objSkill.SkillName}">
                    <label class="form-check-label" for="skill${objSkill.SID}">${objSkill.SkillName} (${objSkill.Category})</label>
                </div>
            `
        })
        elDisplay.appendChild(elSkillSection)
    }

    // --- 4. AWARDS/CERTS ---
    const objAwardRes = await fetch('/api/awards')
    const arrAwards = await objAwardRes.json()
    
    if (arrAwards.length > 0) {
        const elAwardSection = document.createElement('div')
        elAwardSection.className = "mt-4 p-3 border rounded bg-white"
        elAwardSection.innerHTML = '<h3 class="h6 border-bottom pb-2">Awards & Certifications</h3>'
        
        arrAwards.forEach(objAward => {
            elAwardSection.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input chk-resume-award" type="checkbox" value="${objAward.Title}" id="award${objAward.AID}" aria-label="Include award ${objAward.Title}">
                    <label class="form-check-label" for="award${objAward.AID}">${objAward.Title}</label>
                </div>
            `
        })
        elDisplay.appendChild(elAwardSection)
    }
    
}

/*
    AI-created function that was created at the same time as refreshUI(). This one specifically targets 
    slotting in details into their respective jobs. 

    UPDATE: Added a check so that if a detail is selected, then ilts corresponding job is automatically selected.

*/
async function fetchAndRenderDetails(JID) {
    const objRes = await fetch(`/api/details?jid=${JID}`)
    const arrDetails = await objRes.json()
    const elDetailContainer = document.getElementById(`detailsFor${JID}`)

    elDetailContainer.querySelectorAll('.chk-resume-detail').forEach(chk => {
        chk.addEventListener('change', (e) => {
            if (e.target.checked) {
                const elJobCheckbox = document.getElementById(`job${JID}`)
                if (elJobCheckbox) {
                    elJobCheckbox.checked = true
                }
            }
        })
    })

    arrDetails.forEach(objDetail => {
        elDetailContainer.innerHTML += `
            <div class="form-check">
                <input class="form-check-input chk-resume-detail" type="checkbox" value="${objDetail.Descr}" id="det${objDetail.DID}">
                <label class="form-check-label small" for="det${objDetail.DID}">${objDetail.Descr}</label>
            </div>
        `
    })
    
}

/*

    AI-Created Function that aims to populate the job dropdown from the hidden job responsibilities section.
    Once the --Select a Job-- button is pressed, jobs array is directly accessed. Reveals the job responsibilities
    section if the # off jobs in the arrJobs > 0.

*/
async function populateJobDropdown() {
    const elSelect = document.getElementById('selJob')
    const objRes = await fetch('/api/jobs')
    const arrJobs = await objRes.json() // Fix: Access array directly

    elSelect.innerHTML = '<option value="">-- Select a Job --</option>'
    arrJobs.forEach(objJob => {
        elSelect.innerHTML += `<option value="${objJob.JID}">${objJob.Company}</option>`
    })

    // If we have jobs, show the details section
    if (arrJobs.length > 0) {
        document.getElementById('sectionDetails').classList.remove('d-none')
    }
}


