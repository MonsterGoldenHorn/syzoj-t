const randomstring = require('randomstring');
const fs = require('fs-extra');
const jwt = require('jsonwebtoken');

let Judger = syzoj.lib('judger');
let CodeFormatter = syzoj.lib('code_formatter');
let JudgeState = syzoj.model('judge_state');
let FormattedCode = syzoj.model('formatted_code');
let Problem = syzoj.model('question_bank');

app.get('/problem/:id/submit/:sid', async (req, res) => {  
let judge_state;
try {
    let id = parseInt(req.params.id);
    let sid = parseInt(req.params.sid);
    judge_state = await JudgeState.findById(sid);
    let problem = await Problem.findById(id);
    problem.validate();
    if (!syzoj.config.enabled_languages.includes(judge_state.language)){
		throw new ErrorMessage('不支持该语言。')
    };

      let code;

	if (Buffer.from(judge_state.code).length > syzoj.config.limit.submit_code) throw new ErrorMessage('代码太长。');
        code = judge_state.code;
	judge_state.code_length=Buffer.from(code).length;
    
    let contest;
	judge_state.type = 0;
    await judge_state.save();
	
//    await judge_state.updateRelatedInfo(true);

    if (syzoj.languages[judge_state.language].format) {
      let key = syzoj.utils.getFormattedCodeKey(judge_state.code, judge_state.language);
      let formattedCode = await FormattedCode.findOne({
        where: {
          key: key
        }
      });

      if (!formattedCode) {
        let formatted = await CodeFormatter(judge_state.code, syzoj.languages[judge_state.language].format);
        if (formatted) {
          formattedCode = await FormattedCode.create({
            key: key,
            code: formatted
          });

          try {
            await formattedCode.save();
          } catch (e) {}
        }
      }
    }
//judge方法可以传时间参数，加在接口里面或者judge_state中存放
if(judge_state.status != null &&  judge_state.status != "")
{   
    throw new ErrorMessage('已有提交记录。')
}
try {
      await Judger.judge(judge_state, problem, 3);     
      judge_state.pending = true;
      judge_state.status = 'Waiting';
      await judge_state.save();
    } catch (err) {
      throw new ErrorMessage(`无法开始评测：${err.toString()}`);
    }
   res.json({ resulte: '提交成功' });
  } catch (e) {
    syzoj.log(e);
    judge_state.status = 'Invalid Interaction';
    await judge_state.save();
    res.json({ resulte: e});
  }
});
