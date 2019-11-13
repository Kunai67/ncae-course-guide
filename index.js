const strandForm = document.getElementById("strand-form");
const gsaForm = document.getElementById("gsa-form");
const opForm = document.getElementById("op-form");

let OPObj;
fetchJSON("occupational-preference").then(value => OPObj = value);

// TALLIES POINTS FOR EACH STRAND
// Base here which course to push for student
const tally = {
    STEM: 0,
    ABM: 0,
    HUMSS: 0,
    TVL: 0,
    ART: 0,
    SPO: 0,
};

// EVENT LISTENERS
gsaForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const strandResult = makeResultCallback(e, strandForm);
    const gsaResult = makeResultCallback(e, gsaForm);
    tallyATResult(strandResult, tally);
    tallyGSAResult(gsaResult, tally);
    fetchJSON("tracks").then((value) => generateOPForm(getCourse(processResult(tally, value))));
});

opForm.addEventListener("submit", function (e) {
    const result = getHighestRank(makeResultCallback(e, opForm));
    for (let i = 0; i < result.length; i++) {
        let elem = OPObj[result[i].key];
        let heading = document.createElement('h3');
        heading.innerText = elem.name;
        let desc = document.createElement('p');
        desc.innerText = elem.desc;
        let courseUL = document.createElement('ul');
        let display = document.getElementById('display');

        display.appendChild(heading);
        display.appendChild(desc);
        
        for (let j = 0; j < elem.courseGroups.length; j++) {
            let course = document.createElement('h4');
            course.innerText = elem.courseGroups[j].group;
            courseUL.appendChild(course);
            for (let k = 0; k < elem.courseGroups[j].course.length; k++) {
                let courseLi = document.createElement('li');
                courseLi.innerText = elem.courseGroups[j].course[k];
                courseUL.appendChild(courseLi);
            }
        }

        display.appendChild(courseUL);
    }
})

// UTIL FUNCTIONS
// Gets form values and makes an object with format:
// { key: input.id, value: input.value }
function makeResultCallback(e, formElem) {
    e.preventDefault();
    const inputs = Array.from(formElem.firstElementChild.children).filter(
        function (val) {
            if (val.tagName.toLowerCase() == "div") {
                return val.children[1].tagName.toLowerCase() == "input";
            }
        }
    );
    const result = {};
    for (let i = 0; i < inputs.length; i++) {
        result[inputs[i].children[1].id] = Number(inputs[i].children[1].value);
    }
    return result;
}

// MUTATES RESULTOBJ TO BE A SORTED ARRAY OF OBJECTS WITH KEY AND VALUE
function sortResults(resultObj) {
    const resultArray = [];
    for (const key in resultObj) {
        resultArray.push({
            key,
            value: resultObj[key]
        });
    }

    resultArray.sort((a, b) => b.value - a.value);
    return resultArray;
}

// RETURNS AN ARRAY OF HIGHEST PERCENTILE RANK WITH KEY AND VALUE
function getHighestPR(resultObj) {
    return sortResults(resultObj).filter((currObj, i, arr) => currObj.value == arr[0].value);
}

function getHighestRank(resultObj) {
    return sortResults(resultObj).filter((currObj, i, arr) => currObj.value == arr[arr.length - 1].value);
}

function processResult(resultObj, interpretationObj) {
    const highestPRArr = getHighestPR(resultObj);
    const transmutedArray = [];
    for (let i = 0; i < highestPRArr.length; i++) {
        transmutedArray.push(interpretationObj[highestPRArr[i].key]);
    }
    return transmutedArray;
}

// TALLIES GENERAL SCHOLASTIC ABILITY
// Depending on Highest Category, gives a point to a certain strand
function tallyGSAResult(resultObj, tallyObj) {
    const GSAArr = getHighestPR(resultObj);

    for (let i = 0; i < GSAArr.length; i++) {
        switch (GSAArr[i].key) {
            case 'SA':
                tallyObj.STEM++;
                break;
            case 'RC':
            case 'VA':
                tallyObj.HUMSS++;
                break;
            case 'LRA':
                tallyObj.ABM++;
                tallyObj.HUMSS++;
                break;
            case 'MA':
                tallyObj.STEM++;
                tallyObj.ABM++;
                break;
            default:
                break;
        }
    }
}

// TALLIES TRACKS
// Gives two points for non-academic track and one point for academic tracks
function tallyATResult(resultObj, tallyObj) {
    const ATArr = getHighestPR(resultObj);

    for (let i = 0; i < ATArr.length; i++) {
        switch (ATArr[i].key) {
            case 'STEM':
                tallyObj.STEM++;
                break;
            case 'HUMSS':
                tallyObj.HUMSS++;
                break;
            case 'ABM':
                tallyObj.ABM++;
                break;
            case 'TVL':
                tallyObj.TVL += 2;
                break;
            case 'ART':
                tallyObj.ART += 2;
                break;
            case 'SPO':
                tallyObj.SPO += 2;
                break;

            default:
                break;
        }
    }
}

function getCourse(processedResultObj) {
    let courses = [];
    for (let i = 0; i < processedResultObj.length; i++) {
        courses = courses.concat(processedResultObj[i].courses);
    }

    courses = courses.filter((val, i, arr) => arr.indexOf(val) === i);
    return courses;
}

function generateOPForm(courseArr) {
    gsaForm.style.display = 'none';
    strandForm.style.display = 'none';
    
    let legend = document.createElement('legend');
    legend.innerText = "OCCUPATIONAL PREFERENCES";
    opForm.firstElementChild.appendChild(legend);
    for (let i = 0; i < courseArr.length; i++) {
        let div = document.createElement('div');
        let label = document.createElement('label');
        label.innerText = OPObj[courseArr[i]].name;
        let input = document.createElement('input');
        input.type = "number";
        input.id = courseArr[i];
        input.placeholder = 'Rank';
        div.appendChild(label);
        div.appendChild(input);
        opForm.firstElementChild.appendChild(div);
    }
    let submit = document.createElement('button');
    submit.type = "submit";
    submit.innerText = "Submit";
    opForm.firstElementChild.appendChild(submit);
}

async function fetchJSON(filename) {
    const response = await fetch(`json/${filename}.json`);
    const json = await response.json();
    return json;
}

// async function SearchWiki(searchKeyword) {
//     const response = await fetch(
//         `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchKeyword}&format=json&origin=*`
//     );
//     const jsonResponse = await response.json();
//     console.log(jsonResponse);
// }

// SearchWiki('Nelson Mandela');
// SearchWiki('Biologist');