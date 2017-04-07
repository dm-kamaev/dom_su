"use strict";
const config = require('config')

const phoneDimensionDict = {
    moscow: 'dimension2',
    spb: 'dimension3'
}

function numberToTemplate(number) {
    let numberWC = number.substring(4)
    return {
        phoneHref: `+${number}`,
        phoneCode: `8 (${number.substring(1,4)})`,
        phoneNumber: [numberWC.slice(0,3), numberWC.slice(3,5), numberWC.slice(5)].join('-'),
    }
}

function ctxProcessor(data) {
    if (this.state.pancakeUser === undefined)
        return data
    data = data || {}
    // Phone number
    let number = (this.state.pancakeUser.track.numbers && this.state.pancakeUser.track.numbers[this.state.pancakeUser.city.keyword]) ? this.state.pancakeUser.track.numbers[this.state.pancakeUser.city.keyword] :  this.state.pancakeUser.city.phone

    data.general = numberToTemplate(number)
    data.general.city = this.state.pancakeUser.city
    data.general.path = this.path
    data.general.develop = config.app.develop
    data.general.production = config.app.production

    // Analytics
    data.general.analytics = {
        GAUA: config.analytics.google,
        phone: data.general.phoneHref,
        phoneDimension: phoneDimensionDict[this.state.pancakeUser.city.keyword]
    }


    if (config.app.develop) {
        data.noindex = true
    }

    if (data.generateCanonical){
        data.canonical = true
        data.canonicalPath = data.generateCanonical()
    } else if (data.autoCanonical != false && Object.keys(this.request.query).length > 0){
        data.canonical = true
        data.canonicalPath = this.request.origin + this.request.path
    }
    return data
}

module.exports = {
    ctxProcessor
}
