"use strict";

const logger = require('logger')(module)

class QueueAsync{
    constructor(){
        this.queue = []
    }
    push(task){
        this.queue.push(task)
    }

    async do(){
        try{
            let previousResult;
            while (this.queue.length !== 0){
                let task = this.queue.shift()
                previousResult = await task(previousResult)
            }
            return previousResult
        } catch (e){
            logger.error(e)
        }
    }
}

module.exports = { QueueAsync: QueueAsync}