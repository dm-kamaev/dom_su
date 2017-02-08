"use strict";

class PancakeUser {
    constructor(opts){
        this.uuid = opts.uuid
        this.isNew = opts.isNew
        this.city = opts.city
    }
}

module.exports = { PancakeUser }