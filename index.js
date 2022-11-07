const express = require('express');
const path = require('path');

const app = express()

app.use((req, res, next) => {
    //This enables web-assembly
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next()
})
app.use(express.static("./dist", {
    extensions: ['js']
}))
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

app.listen(8080, () => {
    console.log("Listening...")
})