'use strict';
const { AdminPanelError, ErrorCodes } = require('./errors');

const AdminModelClassName = 'AdminModel'

class AdminPanel {

    constructor(){
        this.models = {}
    }

    addModel(Model){
        if (Model === undefined)
            throw new AdminPanelError(ErrorCodes.ModelIsEmpty)

        if (typeof Model.constructor !== 'function' || (typeof Model.constructor === 'function' && Model.constructor.name !== AdminModelClassName ))
            throw new AdminPanelError(ErrorCodes.NeedAdminModelType, `Type - ${ Model } | Class - ${(typeof Model.constructor === 'function') ? Model.constructor.name : undefined}`)

        if (this.models[Model.name])
            throw new AdminPanelError(ErrorCodes.DuplicateModelName, Model.name)

        this.models[Model.name] = Model
    }

    getModel(modelName){
        let model = this.models[modelName]
        if (model && model.constructor && model.constructor.name === AdminModelClassName){
            return model
        }
        throw new AdminPanelError(ErrorCodes.ModelIsNotFound, `Model ${modelName} is not found`)
    }

    getAllModel(){
        let modelNames = Object.keys(this.models)
        modelNames.sort(function(a, b){
         var nameA=a.toLowerCase(), nameB=b.toLowerCase();
         if (nameA < nameB)
          return -1;
         if (nameA > nameB)
          return 1;
         return 0;
        });
        return modelNames
    }

    getModelItemList(modelName, options){
        const model = this.getModel(modelName)
        return model.getItemList(options)
    }

    getModelItem(modelName, keyValue, options){
        const model = this.getModel(modelName)
        return model.getItem(keyValue, options)
    }

    buildReferences(){
        const model_names = Object.keys(this.models)
        for (let model_name of model_names){
            let attrs = this.models[model_name].getAttrs()
            for (let attr of attrs){
                if (attr.ref){
                    this.models[model_name].model.belongsTo(this.models[attr.ref].model, {foreignKey: attr.name})
                    if (this.models[attr.ref] === undefined)
                        throw new AdminPanelError(ErrorCodes.ReferencesModelError, `Model - ${this.models[model_name].name} | Attr - ${attr.name} | Please AdminPanel.addModel() - ${attr.ref}`)
                    attr.refModel = this.models[attr.ref]
                }
            }
        }
    }
}


module.exports =  {AdminPanel: AdminPanel}
