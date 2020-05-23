const request = require('request');

export type Note = {
  uid: number,
  sync_id: string,
  seqid: string,
  eseqid: string,
  folderId: string,
  // is this note makred favorite? 0/1
  favorite: number,
  // is this note in markdown format? 0/1
  markdown: number,
  pos: number,
  call_timestamp: number,
  // milliseconds since unix epoch
  modify_time: number,
  title: string,
  detail: string,
  folder_type: number,
  // is this note makred locked? 0/1
  is_locked: number
};

// on success, return [json format of raw data, list of parsed notes]
export async function download(username: string, password: string): Promise<[string, Note[]]> {
  // I know chaining callbacks is not favorable now, but I haven't yet find a package
  // that provides exactly the same featrues, and since I am new to js/ts, 
  // I am not fully able to modify these codes freely
  return new Promise((resolve, reject) => {
    request.post('https://account.smartisan.com/v2/session/?m=post', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://account.smartisan.com/',
      },
      form: {
        username: username,
        password: password,
        extended_login: '1'
      }
    }, (err: any, res: any, _body: any) => { // why "Parameter implicitly has an 'any' type"? I have installed @types/request?
      if (err) { return reject(err); }
      const cookie = res.headers['set-cookie'];
      if (!cookie) { return reject('failed to login, maybe username or password is wrong'); }
      const sess = cookie.join('').match(/SCA_SESS=([\w-_]+)/)[1];
      request.get('https://cloud.smartisan.com/apps/note/index.php?r=v2/getList', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
          'Referer': 'https://cloud.smartisan.com/apps/note/',
          'Cookie': 'SCA_SESS=' + sess + '; SCA_LOGIN=1'
        },
      }, (err: any, _res: any, body: any) => {
        if (err) { return reject(err); }
        resolve([body, JSON.parse(body).data.note]);
      });
    });
  });
}