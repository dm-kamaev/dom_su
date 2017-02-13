"use strict";
const {QueueAsync} = require('./queue')

class PancakeService {
    constructor(){
        let self = this
        this.queue = new QueueAsync(self)
    }

    runAsyncTask() {
        this.queue.do()
    }
}

module.exports = {
    PancakeService
}