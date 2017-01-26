var Sequelize = require('sequelize')
var opts = {
    define: {
        freezeTableName: true
    }
}

var sequelize = new Sequelize('postgres://domovenok:domovenokPG@localhost:5432/pancake', opts);


var Picture = sequelize.define('pictures', {
    title: Sequelize.STRING,
    pic: Sequelize.STRING
})

var Article = sequelize.define('articles', {
    title: Sequelize.STRING,
    pub_date: Sequelize.DATEONLY,
    picture_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Picture,
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    preview_text: Sequelize.TEXT,
    full_text: Sequelize.TEXT,
    active: Sequelize.BOOLEAN,
    url: Sequelize.STRING,
    title_meta: Sequelize.STRING,
    description_meta: Sequelize.STRING,
    keywords_meta: Sequelize.STRING,
});

var Client = sequelize.define('clients', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    param: Sequelize.JSON
});

var User = sequelize.define('users', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    param: Sequelize.JSON,
});

var UTMS = sequelize.define('utms', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    data: Sequelize.JSON
})

var Employee = sequelize.define('employees', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    param: Sequelize.JSON
});

var City = sequelize.define('cities', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    title: Sequelize.STRING,
    domain: Sequelize.STRING,
    keyword: Sequelize.STRING,
    active: {type: Sequelize.BOOLEAN}
});

var Token = sequelize.define('tokens', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    token: {type: Sequelize.UUID},
    user_uuid: {
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    employee_uuid: {
        type: Sequelize.UUID,
        references: {
            model: Employee,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    client_uuid: {
        type: Sequelize.UUID,
        references: {
            model: Client,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN},

});


var Phone = sequelize.define('phones', {
    uuid: {type: Sequelize.UUID, primaryKey: true},
    number: Sequelize.STRING,
    city_uuid: {
        type: Sequelize.UUID,
        references: {
            model: City,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    user_uuid: {
        type: Sequelize.UUID,
        references: {
            model: User,
            key: 'uuid',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
        }
    },
    active: {type: Sequelize.BOOLEAN}
});

//sequelize.sync()


module.exports = {Phone: Phone, Article: Article, Picture: Picture}