/* Research export schema 3. No questionnaire scores or unobserved events are inferred. */
(function(root){
  const version='3.0-aoi';
  const aois=['question','face_image','answers','navigation','lesson_content','progress','feedback','other_screen'];
  const sources={proposal:'RESEARCH PROPOSAL.docx: Research Design; Variables and Measures; Instruments; Procedure',webgazer:'https://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf',ueq:'https://www.ueq-online.org/Material/Handbook.pdf'};
  const guide=[
    ['Design','Within-participant comparison. Each participant completes adapted and standard. Record assigned AS or SA order and period 1 or 2.'],
    ['Session pairing','Use the same anonymous participant ID in both periods. Never use names. Keep pilot and main-study sessions separate.'],
    ['Independent variable','Interface condition: adapted versus standard. The contrast is the whole interface package, not the effect of any single feature.'],
    ['H1 outcome','Overall UX: use the UEQ Attractiveness scale if UEQ is administered. This operational choice needs protocol approval; do not invent a combined SUS/UEQ score.'],
    ['H2 outcomes','Usability: SUS total. Engagement: UES-SF overall and its official subscales. Administer approved instruments separately after each condition.'],
    ['H3 outcomes','Task completion, elapsed task time, observed interaction errors, and facilitator assistance events. Incorrect test answers are a separate learning-performance measure.'],
    ['Additional performance','Accuracy out of ten, question response time and answer changes. No pre-test means no estimate of learning improvement.'],
    ['Exploratory gaze','AOI sample shares and first recorded sample latency per task. These are estimates, not fixations, dwell durations, cognitive load or proof of attention.'],
    ['AOI denominator','AOI hit count / all on-screen samples with AOI mapping in that task. Not divided by time. Available-sample count records whether the area was visible.'],
    ['AOI missingness','Blank count/share means area was not observed as available, mapping is missing or gaze is absent. A zero requires eligible data and an available area with no hits.'],
    ['AOI geometry','Actual visible element rectangles at sample time. First match wins: question, face image, answers, navigation, lesson content, progress, feedback. Other screen is residual.'],
    ['AOI limitations','Areas differ in size and position between conditions. Shares are not size-adjusted. Compare the same task/AOI; do not interpret residual screen gaze as distraction.'],
    ['Timing','Task elapsed time runs from task display to advance/stop. Visible time removes hidden-tab time, not idle time or every break. Setup/calibration is separate.'],
    ['Partial sessions','New sessions are checkpointed on task changes and periodically. An interrupted checkpoint is not a confirmed withdrawal; the last few seconds may be missing.'],
    ['Historical sessions','Old region totals cannot reconstruct AOIs. Old recordings may lack lesson IDs, phase timing and order. Leave these missing and do not pool blindly with schema 3.'],
    ['Manual observations','Enter one observed event per row. Categories: assistance, interaction_error, break. Count prompts separately; predefine assistance levels before the pilot.'],
    ['Zero versus missing','Leave uncollected values blank. Enter zero only after observation confirms no events. Blank questionnaires are not zero scores.'],
    ['Questionnaires','Enter officially scored values, version/language, respondent and administration support. Do not substitute parent ratings for child ratings without an approved protocol.'],
    ['Diagram','Viewport-normalised sample-density image, separate lesson/test panels. Calibration and off-screen samples excluded; scales differ by panel.'],
    ['Master workbook','Append website table rows below matching headers. Keep formulas in calculated columns. Store large raw-gaze exports separately if needed; retain session IDs.'],
    ['Data protection','Workbook contains sensitive research data, but no camera images. Keep it in approved encrypted storage; never upload participant exports to public GitHub.'],
    ['Remote collection','Downloads and IndexedDB stay on the participant device. There is no central collection endpoint or automatic transfer to the researcher laptop.'],
    ['Quality checks','Report gaze missingness and assess calibration accuracy in a separate validation procedure before formal research. No accuracy threshold is claimed here.'],
    ['Analysis','Use participant-level paired comparisons; do not treat question rows or gaze samples as independent participants. Pre-specify outcomes and multiplicity handling.'],
    ['Sources',sources.proposal],['WebGazer source',sources.webgazer],['UEQ scoring reference',sources.ueq],['SUS reference','https://hci-studies.org/methods-and-measures/downloads/SUS_Brooke1996.pdf'],['UES-SF reference','https://doi.org/10.1016/j.ijhcs.2018.01.004']
  ];
  const dictionary=[
    ['condition','Independent','adapted / standard','Researcher-assigned interface package','Automatic','Design'],
    ['order_group; period','Design factors','AS / SA; 1 / 2','Assigned order and presentation period; not dependent variables','Researcher setup','Design'],
    ['participant_id; session_id; study_stage','Identifiers','text; pilot / main','Pair repeated sessions; distinguish pilot from main data','Setup / automatic','Design'],
    ['UEQ Attractiveness','Dependent: H1','-3 to +3','Official scale score for overall impression; chosen operationalisation, not an all-scale composite','Manual questionnaire','Proposal H1; UEQ handbook'],
    ['SUS total','Dependent: H2','0 to 100','Official SUS usability score; not percent correct','Manual questionnaire','Proposal H2'],
    ['UES-SF overall and subscales','Dependent: H2','1 to 5','Official scoring after required reverse coding; engagement self-report','Manual questionnaire','Proposal H2'],
    ['completed; task_status','Dependent: H3','TRUE / FALSE; status','Advance through task, irrespective of answer correctness. Checkpoint is not confirmed dropout','Automatic / observer verification','Proposal H3'],
    ['elapsed_s; learning_elapsed_s','Dependent: H3','seconds','Display to advance/stop; lessons plus quiz; excludes setup and calibration','Automatic, schema 3','Proposal H3'],
    ['interaction_error_count','Dependent: H3','count','Observed mis-click/navigation error/repeated action, coded with a predefined rule','Manual observation','Proposal H3'],
    ['assistance_count; assistance_level','Dependent: H3','count; protocol-defined code','Facilitator prompt/intervention; use the same hierarchy in both conditions','Manual observation','Proposal H3'],
    ['accuracy; correct; incorrect','Additional dependent','0 to 1; counts','Correct answers / ten; not a usability error count or pre-post gain','Automatic / formula','User-requested test'],
    ['response_s; answer_changes','Additional dependent','seconds; count','Time from question display to final submission; number of answer revisions','Automatic','User-requested test'],
    ['aoi_share','Exploratory dependent','0 to 1','Hits / on-screen mapped samples for that task; blank if no eligible data or no observed area availability','Derived','Exploratory addition'],
    ['first_sample_latency_s','Exploratory dependent','seconds','Time from task display to first recorded AOI hit; blank for no hit, never called time to fixation','Derived, schema 3','Exploratory addition'],
    ['top_share; middle_share; bottom_share','Exploratory descriptive','0 to 1','Each third count / all finite lesson/test samples, including off-screen denominator','Derived','Existing gaze regions'],
    ['on_screen_share; offscreen_share; samples','Quality / descriptive','0 to 1; count','Coordinate availability and bounds; not calibration accuracy, not attention','Derived','WebGazer'],
    ['eye_tracking; aoi_mapping','Quality / metadata','TRUE / FALSE; version','Enabled state and mapping availability; TRUE does not prove accurate tracking','Automatic','WebGazer'],
    ['visible_learning_s; setup_s','Timing / contextual','seconds','Visible-tab time is not active engagement; setup includes calibration','Automatic, schema 3','Timing control'],
    ['viewport; AOI bounds; scroll','Context / geometry','pixels','Actual browser viewport and visible area location at each sample','Automatic','AOI reproducibility'],
    ['instrument_version; respondent; support','Questionnaire context','text','Record instrument/language and who answered; do not silently mix administration modes','Manual','Proposal Instruments'],
    ['break_duration_s; observation_complete','Context / quality','seconds; TRUE / FALSE','Observed breaks and completeness of the observation record','Manual','Proposal Procedure'],
    ['task content, order, scoring, device setup','Controlled variables','protocol','Same lessons/questions/order/scoring; standardise instructions, device, lighting, break and assistance rules','Protocol','Proposal Research Design']
  ];
  function samples(s){
    const wh=String(s.viewport||'').split('x').map(Number);
    return (s.gaze_samples||[]).filter(g=>['lesson','quiz'].includes(g.view)).map(g=>{
      const w=g.width||wh[0],h=g.height||wh[1],valid=Number.isFinite(g.x)&&Number.isFinite(g.y)&&Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0;
      return {...g,width:w,height:h,nx:valid?g.x/w:null,ny:valid?g.y/h:null,on_screen:valid&&g.x>=0&&g.y>=0&&g.x<w&&g.y<h};
    });
  }
  function summary(g){const n=g.length,on=g.filter(x=>x.on_screen).length;return [n,on,n-on,n?on/n:null,n?(n-on)/n:null,...[0,1,2].map(i=>n?g.filter(x=>x.on_screen&&Math.min(2,Math.floor(x.ny*3))===i).length/n:null)];}
  const questionnaireScales=[['SUS','total',0,100],['UES-SF','overall',1,5],['UES-SF','focused_attention',1,5],['UES-SF','perceived_usability',1,5],['UES-SF','aesthetic_appeal',1,5],['UES-SF','reward',1,5],...['Attractiveness','Perspicuity','Efficiency','Dependability','Stimulation','Novelty'].map(n=>['UEQ',n,-3,3])];
  function tables(sessions){
    const specs=[];
    const add=(name,headers,rows,widths=[],manual=[])=>{const spec={name,headers,rows,widths,manual};specs.push(spec);return spec;};
    add('Read me',['Topic','Definition / instructions'],guide,[30,110]);
    const sessionRows=[],taskRows=[],gazeRows=[],aoiRows=[],raw=[],qRows=[],obRows=[];
    sessions.forEach(s=>{
      const id=[s.participant_id,s.session_id,s.condition],g=samples(s),a=s.answers||[],stats=summary(g);
      const tasks=s.tasks||a.map(a=>({phase:'quiz',number:a.question,subject:a.subject,status:'completed',elapsed_ms:a.response_ms,response:a.response,correct:a.correct,answer_changes:a.answer_changes}));
      const timing=s.tasks&&tasks.some(t=>Number.isFinite(t.elapsed_ms))?tasks.reduce((n,t)=>n+(t.elapsed_ms||0),0)/1000:null;
      const visible=s.tasks&&tasks.some(t=>Number.isFinite(t.visible_ms))?tasks.reduce((n,t)=>n+(t.visible_ms||0),0)/1000:null;
      sessionRows.push([...id,s.order_group??null,s.period??null,s.study_stage??null,s.completed??null,s.started_at??null,s.completed_at??null,a.length,s.score??a.filter(x=>x.correct).length,s.incorrect??a.filter(x=>!x.correct).length,null,a.reduce((n,x)=>n+x.response_ms,0)/1000,timing,visible,s.setup_ms==null?null:s.setup_ms/1000,s.eye_tracking??null,...stats.slice(0,3),null,null,s.schema_version||'legacy',s.session_status||(s.completed?'completed':'checkpoint')]);
      tasks.forEach(t=>taskRows.push([...id,t.phase,t.number,t.subject||null,t.status,t.elapsed_ms==null?null:t.elapsed_ms/1000,t.visible_ms==null?null:t.visible_ms/1000,t.response??null,t.correct??null,t.answer_changes??null]));
      ['lesson','quiz'].forEach(phase=>gazeRows.push([...id,phase,...summary(g.filter(x=>x.view===phase))]));
      const groups=new Map();
      tasks.forEach(t=>groups.set(`${t.phase}:${t.number}`,{phase:t.phase,number:t.number,data:[]}));
      g.forEach(x=>{const num=x.view==='quiz'?x.q:x.lesson;if(num==null)return;const key=`${x.view}:${num}`;if(!groups.has(key))groups.set(key,{phase:x.view,number:num,data:[]});groups.get(key).data.push(x);});
      groups.forEach(({phase,number,data})=>{
        const mapped=data.filter(x=>x.on_screen&&x.aoi_version===version),denom=mapped.length;
        aois.forEach(area=>{
          const available=mapped.filter(x=>area==='other_screen'||(x.available_aois||[]).includes(area)).length;
          const hits=mapped.filter(x=>x.aoi===area),measured=available>0&&denom>0;
          const latency=hits.map(x=>x.task_t).filter(Number.isFinite);
          aoiRows.push([...id,phase,number,area,denom,available,measured?hits.length:null,measured?hits.length/denom:null,latency.length?Math.min(...latency)/1000:null,denom?(available?'measured':'area_not_observed_visible'):'no_mapped_gaze']);
        });
      });
      g.forEach(x=>raw.push([...id,x.t,x.view,x.lesson??null,x.q??null,x.task_t??null,x.x,x.y,x.width,x.height,x.nx,x.ny,x.on_screen,x.aoi??null,x.aoi_version??null,(x.available_aois||[]).join('|'),x.scroll_x??null,x.scroll_y??null,...(x.aoi_bounds||[null,null,null,null])]));
      questionnaireScales.forEach(([instrument,scale,min,max])=>qRows.push([...id,instrument,scale,null,min,max,null,null,null,null]));
      tasks.forEach(t=>obRows.push([...id,t.phase,t.number,null,null,null,null,null]));
    });
    const ss=add('Sessions',['participant_id','session_id','condition','order_group','period','study_stage','completed','started_utc','completed_utc','answered','correct','incorrect','accuracy','response_sum_s','learning_elapsed_s','visible_learning_s','setup_s','eye_tracking','samples','on_screen','offscreen','on_screen_share','offscreen_share','schema_version','session_status'],sessionRows);
    ss.formulas={12:r=>`IF(AND(J${r}=10,ISNUMBER(K${r})),K${r}/10,"")`,21:r=>`IF(AND(S${r}>0,ISNUMBER(T${r})),T${r}/S${r},"")`,22:r=>`IF(AND(S${r}>0,ISNUMBER(U${r})),U${r}/S${r},"")`};ss.percent=[12,21,22];
    const pairGroups=new Map();sessions.forEach(s=>{const key=JSON.stringify([s.participant_id,s.study_stage||'legacy']);if(!pairGroups.has(key))pairGroups.set(key,[]);pairGroups.get(key).push(s)});
    const pairs=[];pairGroups.forEach(group=>{
      const adapted=group.filter(s=>s.condition==='adapted'),standard=group.filter(s=>s.condition==='standard'),a=adapted[0],b=standard[0];
      const unique=adapted.length===1&&standard.length===1;
      const design=unique&&a.order_group&&a.order_group===b.order_group&&[1,2].includes(a.period)&&[1,2].includes(b.period)&&a.period!==b.period&&a.order_group[a.period-1]==='A'&&b.order_group[b.period-1]==='S';
      const complete=unique&&a.completed&&b.completed;
      const status=!unique?'missing_or_duplicate_condition':!design?'check_order_metadata':!complete?'incomplete_pair':'paired_complete';
      const rt=s=>(s.answers||[]).reduce((n,x)=>n+x.response_ms,0)/1000;
      pairs.push([group[0].participant_id,group[0].study_stage||'legacy',adapted.length,standard.length,status,unique?a.session_id:null,unique?b.session_id:null,status==='paired_complete'?a.score-b.score:null,status==='paired_complete'?rt(a)-rt(b):null]);
    });
    add('Paired summary',['participant_id','study_stage','adapted_sessions','standard_sessions','pair_status','adapted_session_id','standard_session_id','score_difference_A_minus_S','response_sum_difference_s_A_minus_S'],pairs,[24,18,20,20,35,32,32,30,34]);
    add('Tasks',['participant_id','session_id','condition','phase','task_number','subject','task_status','elapsed_s','visible_s','response','correct','answer_changes'],taskRows);
    const gs=add('Gaze summary',['participant_id','session_id','condition','phase','samples','on_screen','offscreen','on_screen_share','offscreen_share','top_share','middle_share','bottom_share','top_samples','middle_samples','bottom_samples'],gazeRows.map(row=>[...row,...row.slice(9,12).map(p=>p==null?null:Math.round(p*row[4]))]));gs.percent=[7,8,9,10,11];
    gs.formulas=Object.fromEntries([[7,'F'],[8,'G'],[9,'M'],[10,'N'],[11,'O']].map(([col,letter])=>[col,r=>`IF(AND(E${r}>0,ISNUMBER(${letter}${r})),${letter}${r}/E${r},"")`]));
    const as=add('AOI summary',['participant_id','session_id','condition','phase','task_number','aoi','mapped_on_screen_samples','available_samples','hit_samples','aoi_share','first_sample_latency_s','measurement_status'],aoiRows);as.percent=[9];as.formulas={9:r=>`IF(AND(G${r}>0,H${r}>0,ISNUMBER(I${r})),I${r}/G${r},"")`};
    add('Gaze samples',['participant_id','session_id','condition','time_ms','phase','lesson','question','task_time_ms','x_px','y_px','width_px','height_px','x_fraction','y_fraction','on_screen','aoi','aoi_version','available_aois','scroll_x','scroll_y','aoi_left','aoi_top','aoi_width','aoi_height'],raw);
    add('Questionnaires',['participant_id','session_id','condition','instrument','scale','score','minimum','maximum','version_language','respondent','administration_support','collected_utc'],qRows,[],[5,8,9,10,11]);
    add('Task observations',['participant_id','session_id','condition','phase','task_number','observation_complete','interaction_error_count','assistance_count','max_assistance_level','notes'],obRows,[],[5,6,7,8,9]);
    add('Observation events',['participant_id','session_id','condition','phase','task_number','event_time_s','event_type','assistance_level','break_duration_s','notes'],[],[],[0,1,2,3,4,5,6,7,8,9]);
    add('Variable guide',['variable','role','unit / levels','definition','collection','source'],dictionary,[38,28,24,80,28,35]);
    return specs;
  }
  root.ResearchStudy={version,aois,guide,dictionary,tables,samples,summary};
})(typeof window!=='undefined'?window:globalThis);
