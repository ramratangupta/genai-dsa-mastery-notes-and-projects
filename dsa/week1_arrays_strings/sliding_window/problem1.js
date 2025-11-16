//Given an array of integers and an integer k, find the maximum sum of any contiguous subarray of size k. — Hint: fixed window (size = k).

const maximumSumFromArray = (array, windowSize) => {
    console.log("DataInput:", array, "Windowsize:", windowSize);
    const n = array.length;
    if(n<windowSize){
        console.log("DataInput length is less than window size");
        return -1;
    }
    // Step 1 comput sum of first window
    let windowSum = 0
    for(let i=0;i<windowSize;i++){
        windowSum+=array[i];
    }
    let maxSum = windowSum;

    // Step 2: Slide the window
    for(let end=windowSize;end<n;end++){
        windowSum = windowSum -array[end-windowSize] + array[end];
        maxSum = Math.max(maxSum, windowSum);
    }
    console.log("Max sum is :",maxSum)
    return maxSum;

}
//Read array of numbers from arguments
const [arrayStr, windowStr] = process.argv.slice(2);
if (!arrayStr || !windowStr) {
    console.log('Usage: node problem1.js 1,2,3,4 3');
    process.exit(1);
}
const array = arrayStr.split(',').map(Number);
const windowSize = Number(windowStr);
maximumSumFromArray(array, windowSize);