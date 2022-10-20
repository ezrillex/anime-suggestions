let start = performance.now()

const fs = require("fs")

function log(obj) {console.log(obj)}

function extractData(data){
    let op = []
    data.data.forEach(element => {
        // log(`${element.list_status.score}/10 ${element.node.title}  `)
        op.push({
            id:element.node.id,
            title:element.node.title,
            score:element.list_status.score,
            status: element.list_status.status
        })
    });
    // op.forEach(element => log(element))
    return op;
}

function loadData(filename){
    return JSON.parse( fs.readFileSync(filename) )
}


let op_data =extractData( loadData("mock_data.json") )
let data_1 = extractData( loadData("mock_data_1.json") )
let data_2 = extractData( loadData("mock_data_2.json") )

// dont destroy the 0 score of op for denying recommendations later
let op_data_no_score = op_data.filter(element => !element.score > 0)
// remove no score
op_data = op_data.filter(element => element.score > 0)
data_1 = data_1.filter(element => element.score > 0)
data_2 = data_2.filter(element => element.score > 0)

// TODO refactor this
op_data_shared_with_data_1 = op_data.filter(element=>{
    return data_1.findIndex(obj => {
        return obj.id === element.id
    }) > 0
})

op_data_shared_with_data_2 = op_data.filter(element=>{
    return data_2.findIndex(obj => {
        return obj.id === element.id
    }) > 0
})

// log(op_data_shared_with_data_1)
// log(op_data_shared_with_data_2)

unique_data_1 = data_1.filter(element=>{
    return op_data.findIndex(obj => {
        return obj.id === element.id
    }) === -1
})

unique_data_2 = data_2.filter(element=>{
    return op_data.findIndex(obj => {
        return obj.id === element.id
    }) === -1
})

// log(unique_data_1)
// log(unique_data_2)

// ALIGNMENT SCORE
let affinity_average = 0;
let processed = 0;
op_data_shared_with_data_1.forEach(element => {
    // get score of the other guy
    let opinion = data_1.find(obj => obj.id === element.id)
    if(opinion.score === 0 || element.score === 0) return;

    // score calculation
    let diff = Math.abs( opinion.score - element.score)
    

    let left = Math.abs( 1 - element.score );
    let right = Math.abs(10 - element.score);

    // log("min " + left + " max " + left + " diff " + diff + " my score " + element.score + " their score " + opinion.score + " serie " + element.title)
    let max_diff = left > right ? left : right // if the same doesnt matter we just care how much

    let affinity = Number( (((max_diff - diff)/max_diff)*100) );
    // log("Affinity of " + element.title + " is " + affinity.toFixed(0) + "%" )

    affinity_average += affinity
    processed += 1
})
// log(affinity_average)
// log(processed)
// log((affinity_average/processed).toFixed(2) + "%")

affinity_average = 0;
processed = 0;
op_data_shared_with_data_2.forEach(element => {
    // get score of the other guy
    let opinion = data_2.find(obj => obj.id === element.id)
    if(opinion.score === 0 || element.score === 0) return;

    // score calculation
    let diff = Math.abs( opinion.score - element.score)
    

    let left = Math.abs( 1 - element.score );
    let right = Math.abs(10 - element.score);

    // log("min " + left + " max " + left + " diff " + diff + " my score " + element.score + " their score " + opinion.score + " serie " + element.title)
    let max_diff = left > right ? left : right // if the same doesnt matter we just care how much

    let affinity = Number( (((max_diff - diff)/max_diff)*100) );
    // log("Affinity of " + element.title + " is " + affinity.toFixed(0) + "%" )

    affinity_average += affinity
    processed += 1
})

// log(affinity_average)
// log(processed)
// log((affinity_average/processed).toFixed(2) + "%")


// TODO check if average is over threshold to proceed and get some recommendations

const MINIMUM_SCORE_INCLUSIVE = 10

// iterate through animes and get the ones over threshold 
let recommendation_1 = unique_data_1.filter(element => {
    return element.score >= MINIMUM_SCORE_INCLUSIVE
})
// iterate through animes and get the ones over threshold 
let recommendation_2 = unique_data_2.filter(element => {
    return element.score >= MINIMUM_SCORE_INCLUSIVE
})

let recommendations = recommendation_1.concat(recommendation_2) 



// Because removed all no score stuff, I got some recommendations that are dropped/score is 0. I saved the removed of OP and now we filter by the ones that are not in op

recommendations = recommendations.filter(element=>{
    return op_data_no_score.findIndex(obj => {
        if(obj.id === element.id) {
            // log(obj)
            // removed 0 score dropped/completed shows otherwise a dropped show will just reduce the affinity rating. 
            // do keep WATCHING/PLAN TO WATCH/ON-HOLD
            if(obj.status==="dropped" || obj.status === "completed"){
                return true
            }
        }
        return false
    }) === -1
})

// log("Recommendations:")
// recommendations.forEach(element=>{
//     log(element.title)
// })

let end = performance.now()

const used = process.memoryUsage();
for (let key in used) {
  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
}

log("Finished in " + (end - start) + " ms")