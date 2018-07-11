'use strict';
const Sequelize = require('sequelize');
const moment = require('moment');
const CONF = require('/p/pancake/settings/config.js');

const opts = {
  timezone: '+03:00',
  // operatorsAliases: Sequelize.Op, // if true, call error: String based operators are now deprecate
  define: {
    freezeTableName: true,
  },
  logging: false,
};

const sequelize = new Sequelize(`postgres://${CONF.pg.user}:${CONF.pg.password}@${CONF.pg.host}:5432/${CONF.pg.database}`, opts);


const EmployeeNews = sequelize.define('employee_news', {
  title: Sequelize.STRING,
  text: Sequelize.TEXT,
  text_m: Sequelize.TEXT,
  active: Sequelize.BOOLEAN,
  access_list: Sequelize.JSON
});

const FAQ = sequelize.define('faq', {
  name: Sequelize.STRING,
  pub_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW'),
  },
  question: Sequelize.TEXT,
  answer: Sequelize.TEXT,
  block_link: {type: Sequelize.TEXT, defaultValue: null},
  active: Sequelize.BOOLEAN,
  mail: Sequelize.STRING,
  title_meta: Sequelize.STRING,
  description_meta: Sequelize.STRING,
  keywords_meta: Sequelize.STRING,
  h1_text: Sequelize.STRING,
  note: Sequelize.TEXT,
}, {
  scopes: {active: {where: {active: true}}}
}
);

const Picture = sequelize.define('pictures', {
  title: Sequelize.STRING,
  pic: Sequelize.STRING
});

const Article = sequelize.define('articles', {
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
},
{
  scopes: {active: {where: {active: true}}}
},
{
  indexes: [
    {
      unique: true,
      fields: ['url']
    }]
});

const Client = sequelize.define('clients', {
  uuid: {type: Sequelize.UUID, primaryKey: true},
  data: Sequelize.JSON,
});

const User = sequelize.define('users', {
  uuid: {type: Sequelize.STRING, primaryKey: true},
  data: Sequelize.JSON,
  last_action: Sequelize.DATE,
  current_phone: Sequelize.STRING,
  last_client_id: Sequelize.STRING,
  its_robot: Sequelize.BOOLEAN,
});

const Employee = sequelize.define('employees', {
  uuid: {type: Sequelize.UUID, primaryKey: true},
  data: Sequelize.JSON
});

const City = sequelize.define('cities', {
  title: Sequelize.STRING,
  domain: Sequelize.STRING,
  keyword: Sequelize.STRING,
  phone: Sequelize.STRING,
  active: {type: Sequelize.BOOLEAN}
});

const News = sequelize.define('news', {
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
  city_id: {
    type: Sequelize.INTEGER,
    references: {
      model: City,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
},
{
  scopes: {active: {where: {active: true}}}
},
{
  indexes: [
    {
      unique: true,
      fields: ['url']
    }]
}
);

const Token = sequelize.define('tokens', {
  uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
  token: {type: Sequelize.UUID, allowNull: false},
  user_uuid: {
    allowNull: false,
    // type: Sequelize.UUID,
    type: Sequelize.STRING,
    references: {
      model: User,
      key: 'uuid',
      // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  employee_uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: Employee,
      key: 'uuid',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  client_uuid: {
    type: Sequelize.UUID,
    allowNull: true,
    references: {
      model: Client,
      key: 'uuid',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  active: {type: Sequelize.BOOLEAN, allowNull: false},
});

const PendingToken = sequelize.define('pending_tokens', {
  key: {
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    type: Sequelize.UUID,
    allowNull: false
  },
  token: {
    type: Sequelize.UUID,
    allowNull: false
  },
  init: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  employee_uuid: {
    type: Sequelize.UUID,
  },
  client_uuid: {
    type: Sequelize.UUID,
    allowNull: true,
  },
});

const Ticket = sequelize.define('tickets', {
  data: Sequelize.JSON,
  type: Sequelize.STRING,
  isSend: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  // instanceMethods: {
  //   buildMessage: function () {
  //     let textTicket = {action: 'NewOnlineObjects', param: [{type: this.type, data: this.data}]};
  //     if (!textTicket.param[0].data.date){
  //       textTicket.param[0].data.date = moment.utc(this.createdAt).toISOString();
  //     }
  //     return JSON.stringify(textTicket);
  //   }
  // }
});


Ticket.prototype.buildMessage = function () {
  let textTicket = {action: 'NewOnlineObjects', param: [{type: this.type, data: this.data}]};
  if (!textTicket.param[0].data.date){
    textTicket.param[0].data.date = moment.utc(this.createdAt).toISOString();
  }
  return JSON.stringify(textTicket);
};


const Phone = sequelize.define('phones', {
  key: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  number: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  city_id: {
    type: Sequelize.INTEGER,
    references: {
      model: City,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  living: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  user_uuid: {
    // type: Sequelize.UUID,
    type: Sequelize.STRING,
    allowNull: true,
    references: {
      model: User,
      key: 'uuid',
      // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  active: {
    type: Sequelize.BOOLEAN
  },
  category_type: {
    type: Sequelize.STRING,
    defaultValue: 'client', // client or applicant
    isIn: ['client', 'applicant'] // cleint or employee
  }
}, {
  // classMethods: {
  //   attributesInternalAPI: function () {
  //     return ['key', 'number', 'active'];
  //   },
  //   includeInternalAPI: function () {
  //     return [{model: City, attributes: ['keyword']}];
  //   },
  //   formatResultIntenralAPI: function (data) {
  //     return data.map((item)=>{return {key: item.key, number: item.number, active: item.active, city: item.city.keyword};});
  //   },
  //   createInternalAPI: async function (data) {
  //     let city = await City.findOne({where: {keyword: data.city}});
  //     await Phone.create({
  //       city_id: city.id,
  //       number: data.number,
  //       living: false,
  //       user_uuid: null,
  //       active: data.active,
  //       category_type: data.category_type || 'client',
  //     });
  //   },
  // },
  // instanceMethods: {
  //   updateInternalAPI: async function (data){
  //     this.number = data.number;
  //     this.active = data.active;
  //     this.category_type = data.category_type || 'client';
  //     let city = await City.findOne({
  //       where: {
  //         keyword: data.city
  //       }
  //     });
  //     this.city_id = city.id;
  //     await this.save();
  //   }
  // }
});

Phone.attributesInternalAPI = function () {
  return ['key', 'number', 'active'];
};

Phone.includeInternalAPI = function () {
  return [{model: City, attributes: ['keyword']}];
};

Phone.formatResultIntenralAPI = function (data) {
  return data.map((item)=>{return {key: item.key, number: item.number, active: item.active, city: item.city.keyword};});
};

Phone.createInternalAPI = async function (data) {
  let city = await City.findOne({where: {keyword: data.city}});
  await Phone.create({
    city_id: city.id,
    number: data.number,
    living: false,
    user_uuid: null,
    active: data.active,
    category_type: data.category_type || 'client',
  });
},

Phone.prototype.updateInternalAPI = async function(data) {
  this.number = data.number;
  this.active = data.active;
  this.category_type = data.category_type || 'client';
  let city = await City.findOne({
    where: {
      keyword: data.city
    }
  });
  this.city_id = city.id;
  await this.save();
};


Phone.belongsTo(City, { foreignKey: 'city_id' });

const Visit = sequelize.define('visits', {
  uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
  user_uuid: {
    allowNull: false,
    type: Sequelize.STRING,
    // type: Sequelize.UUID,
    references: {
      model: User,
      key: 'uuid',
      // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  begin: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW'),
  },
  end: Sequelize.DATE,
  data: Sequelize.JSON,
});

const Review = sequelize.define('reviews', {
  name: Sequelize.STRING,
  date: {
    type: Sequelize.DATE,
    // defaultValue: Sequelize.fn('NOW'),
  },
  age: Sequelize.STRING,
  job: Sequelize.STRING,
  mail: Sequelize.STRING,
  rating: Sequelize.INTEGER,
  review: Sequelize.TEXT,
  answer: Sequelize.TEXT,
  active: Sequelize.BOOLEAN,
  send_on_save: Sequelize.BOOLEAN,
  block_link: {type: Sequelize.TEXT, defaultValue: null},
  last_modified: Sequelize.DATE,
  note: Sequelize.TEXT,
  title_meta: Sequelize.STRING,
  description_meta: Sequelize.STRING,
  keywords_meta: Sequelize.STRING,
  isOld: Sequelize.BOOLEAN,
  city_id: {
    type: Sequelize.INTEGER,
    references: {
      model: City,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  coefficient_for_sort: {
    type: Sequelize.INTEGER,
  },
  departure_id: Sequelize.STRING,
}, {
  scopes: {active: {where: {active: true}}}
});

const Event = sequelize.define('events', {
  uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
  date: {
    type: Sequelize.DATE,
    // defaultValue: Sequelize.fn('NOW'),
  },
  visit_uuid: {
    allowNull: false,
    type: Sequelize.UUID,
    references: {
      model: Visit,
      key: 'uuid',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  token_uuid: {
    type: Sequelize.UUID,
    references: {
      model: Token,
      key: 'uuid',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  data: Sequelize.JSON,
  type: Sequelize.STRING,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
});

const UTMS = sequelize.define('utms', {
  uuid: {type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4},
  data: Sequelize.JSON,
  event_uuid: {
    allowNull: true,
    type: Sequelize.UUID,
    references: {
      model: Event,
      key: 'uuid',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  user_uuid: {
    allowNull: false,
    // type: Sequelize.UUID,
    type: Sequelize.STRING,
    references: {
      model: User,
      key: 'uuid',
      // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
});

const ShortUrl = sequelize.define('short_url', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: Sequelize.STRING
  },
  url: {
    type: Sequelize.TEXT
  },
  data: {
    type: Sequelize.TEXT
  }
});

const ActionToken = sequelize.define('action_token', {
  token: Sequelize.UUID,
  user_uuid: {
    allowNull: false,
    // type: Sequelize.UUID,
    type: Sequelize.STRING,
    references: {
      model: User,
      key: 'uuid',
      // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
    }
  },
  type: Sequelize.STRING,
});

const Payment = sequelize.define('payments', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  create_time: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn('NOW'),
  },
  OrderId: Sequelize.STRING,
  PaymentId: Sequelize.STRING,
  Amount: Sequelize.BIGINT,
  IP: Sequelize.STRING,
  Description: Sequelize.TEXT,
  Token: Sequelize.STRING,
  CustomerKey: Sequelize.STRING,
  DATA: Sequelize.TEXT,
  payment_org_type: Sequelize.STRING,
  initial: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  notification: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  success: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  redirectNewSite: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  redirectPath: Sequelize.TEXT,
}
);

sequelize.sync();

module.exports = {
  Phone: Phone,
  Article: Article,
  Picture: Picture,
  Client: Client,
  Token: Token,
  PendingToken: PendingToken,
  UTMS: UTMS,
  Employee: Employee,
  City: City,
  User: User,
  Visit: Visit,
  Event: Event,
  FAQ: FAQ,
  Review: Review,
  News: News,
  Ticket: Ticket,
  Payment: Payment,
  EmployeeNews: EmployeeNews,
  ShortUrl: ShortUrl,
  ActionToken: ActionToken,
  sequelize
};