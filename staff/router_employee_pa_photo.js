'use strict';

// GET PHOTO FOR EMPLOYEE PA

const wf = require('/p/pancake/my/wf.js');
const db = require('/p/pancake/my/db.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const logger = require('/p/pancake/lib/logger.js');


module.exports = function (employee_router) {
  employee_router.post('/staff/employee_photo/:file_uuid', get_employee_photo);

  // d5796cf0-79f3-11e8-84d8-1c1b0dc62163 dev1 (liza 1c)
  employee_router.get('/staff/mean_and_material_photo/:file_uuid', get_photo('mean_and_material_photo'));

};

// photo of employee
// POST /staff/employee_photo/f482eb0b-007b-11e6-80de-00155d594900 dev2
// POST /staff/employee_photo/6b759837-c8c2-11e4-944d-002590306b4e dev2
// POST /staff/employee_photo/a2f09a81-8c9b-11e6-80e2-00155d594900 prod
// if not exist photo, then take photo(base64)  from 1C and save to file and redirect to nginx
// else if photo exist in folder(check db) redirect to nginx
async function get_employee_photo(ctx) {
  try {
    const file_uuid = ctx.params.file_uuid;
    let employee_photo = await db.read_one('SELECT file_name, mime_type FROM employee_photo WHERE file_uuid = $1', [ file_uuid ]);
    const url_path = '/stat/employee_photo/';
    if (employee_photo instanceof Error) {
      throw employee_photo;
    } else if (employee_photo) { // exist photo on server
      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: {
          file_path: url_path+employee_photo.file_name,
        }
      };
    } else { // go to 1C and save to file
      const request1C = new Request1Cv3(null, null, null, ctx);
      // {
      //     "Type":     "png",
      //     "TypeMIME": "image/png",
      //     "FileB64": "/9j/4AAQSkZJRgABAQEAtAC0AAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS
      //                 Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ
      //                 CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy ..."
      // }
      await request1C.add('GetFile', { FileID: file_uuid }).do();
      employee_photo = request1C.get();
      if (!employee_photo.ok) {
        throw employee_photo;
      }
      const { FileB64: fileB64, Type: type, TypeMIME: mime_type } = employee_photo.data;
      const file_name = file_uuid+'.'+type;
      const base64 = new Buffer(fileB64, 'base64');
      await wf.write_base64('/p/pancake/stat/employee_photo/'+file_name, base64);

      await db.edit(`
        INSERT INTO
          employee_photo
        (
          file_uuid,
          file_name,
          mime_type
        ) VALUES (
          $1,
          $2,
          $3
        )`, [ file_uuid, file_name, mime_type ]);

      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: {
          file_path: url_path+file_name,
        }
      };
    }
  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = {
      ok: false,
      error: {
        code: -1,
        text: 'Internal error',
      }
    };
  }
}


/**
 * get_photo: wrapper
 * @param  {String} folder_and_table_name: mean_and_material_photo
 * @return {Function}        (ctx)
 */
function get_photo(folder_and_table_name) {
  return function (ctx) {
    return base_get_photo(ctx, folder_and_table_name);
  }
}


/**
 * get_photo_mean_or_material: get photo material or mean
 * GET /staff/mean_and_material_photo/f482eb0b-007b-11e6-80de-00155d594900 dev2
 * @return
 {
   "ok": true,
   "data": {
     "file_path": "/stat/mean_and_material_photo/d5796cf0-79f3-11e8-84d8-1c1b0dc62163.jpg"
   }
 }
 */
async function base_get_photo(ctx, folder_and_table_name) {
  try {
    const file_uuid = ctx.params.file_uuid;
    let photo = await db.read_one(`SELECT file_name, mime_type FROM ${folder_and_table_name} WHERE file_uuid = $1`, [ file_uuid ]);
    const url_path = '/stat/'+folder_and_table_name+'/';
    if (photo instanceof Error) {
      throw photo;
    } else if (photo) { // exist photo on server
      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: {
          file_path: url_path+photo.file_name,
        }
      };
    } else { // go to 1C and save to file
      const request1C = new Request1Cv3(null, null, null, ctx);
      // {
      //     "Type":     "png",
      //     "TypeMIME": "image/png",
      //     "FileB64": "/9j/4AAQSkZJRgABAQEAtAC0AAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS
      //                 Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ
      //                 CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy ..."
      // }
      await request1C.add('GetFile', { FileID: file_uuid }).do();
      photo = request1C.get();
      if (!photo.ok) {
        throw photo;
      }
      const { FileB64: fileB64, Type: type, TypeMIME: mime_type } = photo.data;
      const file_name = file_uuid+'.'+type;
      const base64 = new Buffer(fileB64, 'base64');
      await wf.write_base64('/p/pancake/stat/'+folder_and_table_name+'/'+file_name, base64);

      await db.edit(`
        INSERT INTO
          ${folder_and_table_name}
        (
          file_uuid,
          file_name,
          mime_type
        ) VALUES (
          $1,
          $2,
          $3
        )`, [ file_uuid, file_name, mime_type ]);

      ctx.status = 200;
      ctx.body = {
        ok: true,
        data: {
          file_path: url_path+file_name,
        }
      };
    }
  } catch (err) {
    logger.warn(err);
    ctx.status = 500;
    ctx.body = {
      ok: false,
      error: {
        code: -1,
        text: 'Internal error',
      }
    };
  }
}