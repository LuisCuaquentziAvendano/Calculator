const input = document.getElementById("inputArea")
const output = document.getElementById("output")
const clear = document.getElementById("clear")
const zero = document.getElementById("zero")
const one = document.getElementById("one")
const two = document.getElementById("two")
const three = document.getElementById("three")
const four = document.getElementById("four")
const five = document.getElementById("five")
const six = document.getElementById("six")
const seven = document.getElementById("seven")
const eight = document.getElementById("eight")
const nine = document.getElementById("nine")
const pow = document.getElementById("pow")
const div = document.getElementById("div")
const mult = document.getElementById("mult")
const minus = document.getElementById("minus")
const plus = document.getElementById("plus")
const equal = document.getElementById("equal")
const openP = document.getElementById("openP")
const closeP = document.getElementById("closeP")
const point = document.getElementById("point")

input.addEventListener("keypress", function(event) {  // Calculate if "Enter" is pressed on input
    if (event.key === "Enter") {
        calculate();
    }
});
clear.addEventListener("click", function () { keyClicked("clear") })
zero.addEventListener("click", function () { keyClicked("0") })
one.addEventListener("click", function () { keyClicked("1") })
two.addEventListener("click", function () { keyClicked("2") })
three.addEventListener("click", function () { keyClicked("3") })
four.addEventListener("click", function () { keyClicked("4") })
five.addEventListener("click", function () { keyClicked("5") })
six.addEventListener("click", function () { keyClicked("6") })
seven.addEventListener("click", function () { keyClicked("7") })
eight.addEventListener("click", function () { keyClicked("8") })
nine.addEventListener("click", function () { keyClicked("9") })
pow.addEventListener("click", function () { keyClicked("^") })
div.addEventListener("click", function () { keyClicked("/") })
mult.addEventListener("click", function () { keyClicked("*") })
minus.addEventListener("click", function () { keyClicked("-") })
plus.addEventListener("click", function () { keyClicked("+") })
equal.addEventListener("click", function () { keyClicked("=") })
openP.addEventListener("click", function () { keyClicked("(") })
closeP.addEventListener("click", function () { keyClicked(")") })
point.addEventListener("click", function () { keyClicked(".") })

// This is the function that handles all key clicks
function keyClicked(key) {
    let position = input.selectionStart
    let originalKey = key
    if (key == "=")  // Calculate
        calculate()
    else if (key == "clear") {  // Clear input
        input.value = ""
        input.focus()
    } else {
        if (["+", "-", "*", "/"].includes(key))  // Put a space around operators
            key = " " + key + " "
        // Put the new key in the correct place, it could be in any place of the string
        input.value = input.value.slice(0, position)
        + key + input.value.slice(position, input.value.length)
        // Leave the input focused and the cursor next to the last key pressed
        if (["+", "-", "*", "/"].includes(originalKey))
            position += 2
        input.focus()
        input.setSelectionRange(position + 1, position + 1)
    }
}

// This is the function that does all stuff for calculate an input
function calculate() {
    let string = input.value.replaceAll(" ", "")  // Delete all spaces
    let lists = []
    let structureSyn = []
    let structureNum = []
    let invalidExp = []
    let correctParentheses
    let result
    lists = decomposeSyntax(string)
    lists = improveSyntax(lists)
    structureSyn = lists[0]
    structureNum = lists[1]
    correctParentheses = lists[2]
    string = structureSyn.toString().replaceAll(",", "")
    // There is a unknown symbol, like a , ?
    if (string.includes("alpha")) {
        writeOutput("SYNTAX ERROR", "#f99")
        return
    }
    // There is a unclosed parentheses or it closes before be opened )(
    if (! correctParentheses) {
        writeOutput("SYNTAX ERROR", "#f99")
        return
    }
    // This are all possible syntax errors, symbols: o(operator) n(number) . ( )
    // Other syntax errors were solved before, like error .n
    invalidExp = [".n.", ".o", ".(", ".)", "oo", "(o", "o)", "()"]
    for (i = 0; i < invalidExp.length; i++) {
        if (string.includes(invalidExp[i])) {
            writeOutput("SYNTAX ERROR", "#f99")
            return
        }
    }
    // Other syntax errors: start or end with a point or an operator
    // End with a ( is avoid before with checking parentheses
    invalidExp = [".", "o"]
    for (i = 0; i < invalidExp.length; i++) {
        if (string[0] == invalidExp[i] || string[string.length - 1] == invalidExp[i]) {
            writeOutput("SYNTAX ERROR", "#f99")
            return
        }
    }
    // All syntax is correct, so it is time to solve the math expression
    structureNum = joinFloats(structureNum)  // Join float numbers in this way n.n
    result = parseFloat(solve(structureNum))
    if (! isFinite(result)) {  // There is a math expression due to x/0
        writeOutput("MATH ERROR", "#f99")
        return
    }
    writeOutput(result.toString(), "#fff")  // Show result to the user
}

// This function converts an input into a string with symbols: o(operator) n(number) . ( )
// It is helpful for check syntax later
function decomposeSyntax (string) {
    let structureSyn = []
    let structureNum = []
    let number
    let isNumber = true
    let i = 0
    while (i < string.length) {
        if ([".", "(", ")"].includes(string[i])) {
            structureSyn.push(string[i])
            structureNum.push(string[i])
        } else if (["+", "-", "*", "/", "^"].includes(string[i])) {
            structureSyn.push("o")
            structureNum.push(string[i])
        } else if (! isNaN(string[i])) {
            number = ""
            isNumber = true
            while (i < string.length && isNumber) {
                if (! isNaN(string[i])) {
                    number = number + string[i]
                    i++
                } else {
                    isNumber = false
                    i--
                }
            }
            structureSyn.push("n")
            structureNum.push(number)
        } else {
            structureSyn.push("alpha")
            structureNum.push("alpha")
        }
        i++
    }
    return [structureSyn, structureNum]
}

function writeOutput(result, color) {
    output.textContent = result
    output.style.backgroundColor = color
}

// This function improves the syntax of an input, this avoids syntax errors later as much as possible
function improveSyntax(lists) {
    let structureSyn = lists[0]
    let structureNum = lists[1]
    let counterParen = 0
    let openFirstParen = true
    let i = 0
    while (i < structureSyn.length) {
        if (structureSyn[i] == "(")
            counterParen++
        else if (structureSyn[i] == ")")
            counterParen--
        openFirstParen = counterParen >= 0 && openFirstParen
        if (structureSyn[i] == ".") {
            lists = checkFloats([structureSyn, structureNum, i])
            structureSyn = lists[0]
            structureNum = lists[1]
            i = lists[2]
        } else if (["n", ")"].includes(structureSyn[i]) && i < structureSyn.length - 1) {
            lists = checkMult([structureSyn, structureNum, i])
            structureSyn = lists[0]
            structureNum = lists[1]
            i = lists[2]
        } else if (["(", "o"].includes(structureSyn[i]) && i < structureSyn.length - 1) {
            lists = checkSigns([structureSyn, structureNum, i])
            structureSyn = lists[0]
            structureNum = lists[1]
            i = lists[2]
        }
        i++
    }
    return [structureSyn, structureNum, counterParen == 0 && openFirstParen]
}

// This function puts a 0 before a . if there is not a number there
function checkFloats(lists) {
    let structureSyn = lists[0]
    let structureNum = lists[1]
    let i = lists[2]
    if (i == 0) {
        structureSyn.unshift("n")
        structureNum.unshift("0")
        i++
    } else if (structureSyn[i - 1] != "n") {
            structureSyn.splice(i, 0, "n")
            structureNum.splice(i, 0, "0")
            i++
        }
    return [structureSyn, structureNum, i]
}

// This function puts a * between n(  )n  )( if there is not an operator
function checkMult(lists) {
    let structureSyn = lists[0]
    let structureNum = lists[1]
    let i = lists[2]
    if ((structureSyn[i] == "n" && structureSyn[i + 1] == "(")
    || (structureSyn[i] == ")" && structureSyn[i + 1] == "n")
    || (structureSyn[i] == ")" && structureSyn[i + 1] == "(")) {
        structureSyn.splice(i + 1, 0, "o")
        structureNum.splice(i + 1, 0, "*")
        i++
    }
    return [structureSyn, structureNum, i]
}

// This function puts a 0 before + - if there is not a number there
function checkSigns(lists) {
    let structureSyn = lists[0]
    let structureNum = lists[1]
    let i = lists[2]
    if (structureSyn[i] == "(" && structureSyn[i + 1] == "o") {
        if (["+", "-"].includes(structureNum[i + 1])) {
            structureSyn.splice(i + 1, 0, "n")
            structureNum.splice(i + 1, 0, "0")
            i++
        }
    } else if (structureSyn[0] == "o") {
        if (["+", "-"].includes(structureNum[0])) {
            structureSyn.unshift("n")
            structureNum.unshift("0")
            i++
        }
    }
    return [structureSyn, structureNum, i]
}

// This function does all math calculations
function solve(structureNum) {
    let i
    let j = 0
    let k
    let aux = []
    let order = [["("], ["^"], ["*", "/"], ["+", "-"]]  // Operations hierarchy
    while (j < order.length) {
        i = 0
        aux = []
        while (i < structureNum.length) {
            if (order[j].includes(structureNum[i])) {  // Resolve only the current hierarchy level
                if (structureNum[i] == "(") {  // Solve this expression first
                    k = closeParentheses(structureNum, i)
                    aux.push(solve(structureNum.slice(i + 1, k)))  // Save the result
                    i = k
                } else {  // There is an operator to solve
                    structureNum[i - 1] = parseFloat(aux.pop())  // Last result, it could be a result of ()
                    structureNum[i + 1] = parseFloat(structureNum[i + 1])
                    if (structureNum[i] == "^")
                        aux.push(Math.pow(structureNum[i - 1], structureNum[i + 1]))
                    else if (structureNum[i] == "*")
                        aux.push(structureNum[i - 1] * structureNum[i + 1])
                    else if (structureNum[i] == "/")
                        aux.push(structureNum[i - 1] / structureNum[i + 1])
                    else if (structureNum[i] == "+")
                        aux.push(structureNum[i - 1] + structureNum[i + 1])
                    else if (structureNum[i] == "-")
                        aux.push(structureNum[i - 1] - structureNum[i + 1])
                    i++
                }
            } else  // It will be solved later or it is a number
                aux.push(structureNum[i])
            i++
        }
        structureNum = [].concat(aux)  // This is the current expression solved
        j++  // Next hierarchy level
    }
    return structureNum[0]
}

// This function joins the floats in this way n.n
function joinFloats(structureNum) {
    let newExp = []
    for (i = 0; i < structureNum.length; i++) {
        if (structureNum[i] == ".") {
            newExp.pop()
            newExp.push(structureNum[i - 1] + "." + structureNum[i + 1])
            i++
        } else
            newExp.push(structureNum[i])
    }
    return newExp
}

// This function finds where a parentheses ends
function closeParentheses(structureNum, i) {
    let counter = 1
    i++
    while (i < structureNum.length  && counter != 0) {
        if (structureNum[i] == "(")
            counter++
        else if (structureNum[i] == ")")
            counter--
        i++
    }
    i--
    return i
}

input.focus()
