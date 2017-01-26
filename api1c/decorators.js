'use strict';
const { magicUrl } = require('utils')
const { Token } = require('models')

const UrlBox = new magicUrl()

function loginRequired(routerFunc, elseFunc){
    return function(req, res, next) {
        let redirectPath = UrlBox.getAuthUrl()
        redirectPath += (req.originalUrl == UrlBox.getRedirectGeneral() || req.originalUrl  == UrlBox.getLogoutUrl()) ? '' : ('?path=' + req.originalUrl)
        if (req.cookies.dom_session){
            Token.check(req.cookies.dom_session).then(
                token => {
                    // Meta
                    var meta = arguments[3] || {}
                    meta.token = token
                    return routerFunc (req, res, next, meta)
                },
                error => {
                    if (elseFunc) {
                        var meta = arguments[3] || {}
                        return elseFunc (req, res, next, meta)
                    }
                    res.redirect(redirectPath)
                }
            )
        }
        else {
            if (elseFunc){
                var meta = arguments[3] || {}
                return elseFunc (req, res, next, meta)
            }
            res.redirect(redirectPath)
        }
    }
}

module.exports = {loginRequired: loginRequired}