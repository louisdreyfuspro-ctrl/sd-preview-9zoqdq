/* StrydeUp desktop web app, Add a session: the whole upload, as on the phone, in one desktop dialog.
   The same four steps, words and lists as the mobile flow (Etape 4 - Sessions.html, "Add a session"):
     1 VIDEO          drop or choose the file, checked right away (frame rate, resolution, length, size)
     2 THE BASICS     horse (and rider for the Stable Owner), when, Training or Show, discipline, class height, course type
     3 CONDITIONS     where (your position or a show ground), indoor / outdoor, ground, weather       (optional)
     4 HOW DID IT FEEL?  feeling, the horse was, equipment (kept for next time), notes                 (optional)
   then the upload bar and "Sent · analysing the round". The new session waits in sessionStorage 'sdwPending'
   (SDW_PENDING()) and shows at the top of Sessions as Analysing.

   API:  SDW_UPLOAD_FULL({horse:'Quintus Z', kind:'Show', onDone:rec=>{}})
         without onDone: the page hook window.SDW_ON_UPLOAD(rec) if the page has one, else Sessions opens. */
(function(){
  const W=window.SDW; if(!W) return;
  const T=W.T, esc=W.esc, I=W.I;
  const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the look of the dialog: injected here so any desktop page can open it (built on the tokens of web.css) */
  if(!document.getElementById('sdwUpCss')) document.head.insertAdjacentHTML('beforeend',`<style id="sdwUpCss">
  .wModal.upM{width:min(940px,calc(100vw - 40px));height:min(740px,calc(100vh - 40px));max-height:none}
  .upM .mB{flex:1;padding:22px 28px 10px}
  .upM .mH{padding:22px 28px 0} .upM .mF{align-items:center;padding:14px 28px 18px;border-top:1px solid var(--line)}
  .upM .ico.flip svg{transform:scaleX(-1)}
  .upSteps{display:flex;align-items:center;gap:10px;padding:18px 28px 16px;border-bottom:1px solid var(--line)}
  .upSteps .ln{flex:1;height:1px;background:var(--line2);min-width:12px}
  .upSt{display:flex;align-items:center;gap:10px;text-align:left;cursor:default;min-width:0}
  .upSt.done{cursor:pointer} .upSt.done:hover .t b{color:var(--txt)}
  .upSt .n{width:26px;height:26px;border-radius:50%;flex:0 0 auto;display:grid;place-items:center;font-size:12px;font-weight:750;color:var(--mut);border:1.5px solid var(--line2);transition:background .24s,border-color .24s,color .24s}
  .upSt .t{display:flex;flex-direction:column;min-width:0} .upSt .t b{font-size:13px;font-weight:650;color:var(--mut);white-space:nowrap;transition:color .2s} .upSt .t small{font-size:11px;color:var(--dim);line-height:1.2}
  .upSt.on .n{border-color:var(--blue);background:var(--blue);color:#fff} .upSt.on .t b{color:var(--txt)}
  .upSt.done .n{border-color:var(--blue-line);background:var(--blue-bg);color:var(--blue-ink)} .upSt.done .t b{color:var(--txt2)}
  .upSteps.sent .upSt .n{border-color:var(--blue-line);background:var(--blue-bg);color:var(--blue-ink)}
  .upG2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:36px}
  .upG2.v{grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);gap:28px}
  .upLab{display:flex;align-items:baseline;gap:8px;font-size:11px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);margin:20px 0 10px}
  .upG2 > div > .upLab:first-child{margin-top:2px}
  .upLab em{font-style:normal;font-size:11px;font-weight:550;letter-spacing:0;text-transform:none;color:var(--dim)}
  .upChips .chip{height:34px;font-size:13px} .upChips .chip .ico{color:var(--mut)} .upChips .chip.on .ico{color:var(--blue-ink)}
  .upChips .chip .ck{color:var(--blue-ink);margin-right:-3px}
  .upChips.hz .chip{padding-left:5px} .upChips.hz .chip .lg{margin-left:0;border-radius:50%;width:24px;height:24px;background:var(--card2);color:var(--txt2);border:1px solid var(--line)}
  .upChips.hz .chip.on .lg{background:var(--blue);color:#fff;border-color:var(--blue)}
  .upChips.hts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px} .upChips.hts .chip{height:30px;padding:0;justify-content:center;font-size:12.5px;border-radius:8px}
  .upSeg{display:flex;width:100%} .upSeg button{flex:1;justify-content:center;height:34px;font-size:13px} .upSeg .ico{color:var(--dim)} .upSeg button.on .ico{color:var(--blue-ink)}
  .upDrop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;height:100%;min-height:300px;border-radius:14px;border:1.5px dashed var(--line3);background:var(--card2);cursor:pointer;text-align:center;padding:24px;transition:border-color .2s,background .2s,transform .24s var(--ease)}
  .upDrop:hover{border-color:var(--blue-line)} .upDrop b{font-size:15.5px;font-weight:680;margin-top:8px} .upDrop .mut{font-size:13px}
  .upDrop.over,.upPick.over{border-color:var(--blue);background:var(--blue-bg);transform:scale(1.01)}
  .upDrop .big{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:var(--blue-bg);color:var(--blue-ink);border:1px solid var(--blue-line)}
  .upDrop .big .ico{width:28px!important;height:28px!important}
  .upPick{border-radius:14px;border:1px solid var(--line);background:var(--card2);overflow:hidden;transition:border-color .2s,background .2s,transform .24s var(--ease)}
  .upPick .pv{position:relative;aspect-ratio:16/9;background:radial-gradient(120% 90% at 30% 20%,#2A3A52,#10151D 70%);display:grid;place-items:center;color:#8A94A3}
  .upPick video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .upPick .du{position:absolute;right:10px;bottom:10px;font-size:11.5px;font-weight:700;color:#fff;background:rgba(10,12,16,.72);border-radius:6px;padding:2px 7px}
  .upPick .pb{display:flex;align-items:center;gap:10px;padding:12px 14px}
  .upPick .pb .t{flex:1;min-width:0;display:flex;flex-direction:column} .upPick .pb b{font-size:13.5px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .upPick .pb .t span{font-size:12px;color:var(--mut)}
  .upM .ico.blue{color:var(--blue-ink)}
  .upVer{padding:0 14px 14px;font-size:13px} .upVer .good{color:var(--good-ink)} .upVer .bad{color:var(--bad-ink)}
  .upSpec{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .upSp{display:flex;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid var(--line);background:var(--card)} .upSp:first-child{border-top:0}
  .upSp .ri{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--blue-bg);color:var(--blue-ink);flex:0 0 auto}
  .upSp .t{flex:1;min-width:0;display:flex;flex-direction:column} .upSp .t b{font-size:13.5px;font-weight:650} .upSp .t span{font-size:12px;color:var(--mut);margin-top:1px}
  .upSp .v{text-align:right;flex:0 0 auto} .upSp .v b{display:block;font-size:12.5px;font-weight:650} .upSp .v span{font-size:11.5px;color:var(--dim)}
  .upSp .st{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;flex:0 0 auto}
  .upSp .st.good{background:var(--good-bg);color:var(--good-ink)} .upSp .st.bad{background:var(--bad-bg);color:var(--bad-ink)}
  .upSp.bad{background:color-mix(in srgb,var(--card) 92%,#EC5F57)} .upSp.bad .t span{color:var(--bad-ink)}
  .upTips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .upTip{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card)}
  .upTip .ill{width:72px;height:50px;border-radius:9px;background:#10151D;flex:0 0 auto;overflow:hidden;display:block} .upTip .ill svg{width:100%;height:100%}
  .upTip b{display:block;font-size:13px;font-weight:650} .upTip span{display:block;font-size:12px;color:var(--mut);line-height:1.4;margin-top:2px}
  .upCal{margin-top:12px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);max-width:340px}
  .upCal .h{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px} .upCal .h b{font-size:13.5px;font-weight:650}
  .upCal .cn{width:28px;height:28px;border-radius:7px;display:grid;place-items:center;color:var(--mut)} .upCal .cn:hover:not(:disabled){background:var(--hover);color:var(--txt)} .upCal .cn:disabled{opacity:.3;cursor:default}
  .upCal .w,.upCal .g{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
  .upCal .w span{font-size:11px;font-weight:650;color:var(--dim);padding:4px 0}
  .upCal .g button{height:32px;border-radius:8px;font-size:12.5px;font-weight:600;color:var(--txt2);transition:background .15s,color .15s}
  .upCal .g button:hover:not(:disabled):not(.on){background:var(--hover);color:var(--txt)} .upCal .g button:disabled{color:var(--dim);opacity:.45;cursor:default}
  .upCal .g button.td{box-shadow:inset 0 0 0 1px var(--line3)} .upCal .g button.on{background:var(--blue);color:#fff;box-shadow:none}
  .upCal .s{font-size:12px;color:var(--mut);margin-top:8px;text-align:center}
  .upWhere{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--card)}
  .upWhere .t{flex:1;min-width:0;display:flex;flex-direction:column} .upWhere b{font-size:14px;font-weight:650} .upWhere .t span{font-size:12px;color:var(--mut)}
  .upLocS{margin-top:10px;border-radius:12px;border:1px solid var(--line2);background:var(--card);overflow:hidden}
  .upLocS .box{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-bottom:1px solid var(--line);color:var(--mut)} .upLocS .box svg{width:16px;height:16px;flex:0 0 auto}
  .upLocS input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font-size:13.5px;color:var(--txt)}
  .upLocL{max-height:236px;overflow-y:auto;padding:4px}
  .upLocL .gl{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--dim);padding:9px 10px 4px}
  .upLocR{display:flex;align-items:center;gap:10px;width:100%;padding:7px 10px;border-radius:8px;text-align:left} .upLocR:hover{background:var(--hover)}
  .upLocR .ico{color:var(--mut)} .upLocR .t{flex:1;min-width:0;display:flex;flex-direction:column} .upLocR b{font-size:13px;font-weight:620} .upLocR small{font-size:11.5px;color:var(--mut)}
  .upLocR .ck{color:var(--blue-ink)} .upLocE{padding:12px 10px;font-size:12.5px;color:var(--mut)}
  .upFeel{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
  .upFeel button{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);font-size:12.5px;font-weight:620;color:var(--txt2);transition:border-color .2s,background .2s,color .2s}
  .upFeel button:hover{border-color:var(--line2);color:var(--txt)}
  .upFeel .m{display:flex;align-items:flex-end;gap:3px;height:18px} .upFeel .m i{width:5px;border-radius:2px;background:var(--line2)}
  .upFeel .m i:nth-child(1){height:6px} .upFeel .m i:nth-child(2){height:9px} .upFeel .m i:nth-child(3){height:12px} .upFeel .m i:nth-child(4){height:15px} .upFeel .m i:nth-child(5){height:18px}
  .upFeel button.on{background:var(--blue-bg);border-color:var(--blue-line);color:var(--txt)} .upFeel button.on .m i.f{background:var(--blue)}
  .upIn{width:100%;font:inherit;font-size:13.5px;color:var(--txt);background:var(--card);border:1px solid var(--line2);border-radius:10px;padding:10px 12px;outline:none;resize:vertical;transition:border-color .2s}
  .upIn:focus{border-color:var(--blue-line)} .upIn::placeholder{color:var(--dim)}
  .upGearAdd{display:flex;gap:8px;margin-top:12px} .upGearAdd .upIn{height:36px;padding:0 12px}
  .upPre{display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--mut)} .upPre .ico{color:var(--dim)}
  .upHint{margin-right:auto;font-size:12.5px;color:var(--mut)} .upHint.need{color:var(--txt2)}
  .upSent{max-width:560px;margin:10px auto 0;text-align:center;display:flex;flex-direction:column;align-items:center}
  .upSent .ok{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:var(--blue-bg);color:var(--blue-ink);border:1px solid var(--blue-line);transition:background .3s,color .3s,border-color .3s}
  .upSent .ok .ico{width:30px!important;height:30px!important}
  .upSent .ok.done{background:var(--good-bg);color:var(--good-ink);border-color:rgba(92,196,140,.35)}
  .upSent h2{font-size:21px;font-weight:720;letter-spacing:-.4px;margin-top:18px} .upSent > .mut{font-size:13.5px;margin-top:4px}
  .upRecap{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;width:100%;margin-top:22px;text-align:left}
  .upRecap > div{padding:11px 13px;border-radius:10px;background:var(--card);border:1px solid var(--line);min-width:0}
  .upRecap .lbl{font-size:10.5px} .upRecap b{display:block;font-size:13.5px;font-weight:650;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .upRecap small{display:block;font-size:11.5px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .upBar{width:100%;height:6px;border-radius:3px;background:var(--ring-track);overflow:hidden;margin-top:26px} .upBar i{display:block;height:100%;width:0;border-radius:3px;background:var(--blue);transition:width .2s linear}
  .upPct{font-size:12.5px;color:var(--txt2);font-weight:600;margin-top:10px} .upLeave{font-size:12.5px;margin-top:4px}
  @media (max-width:820px){ .upG2,.upG2.v{grid-template-columns:minmax(0,1fr);gap:8px} .upTips{grid-template-columns:minmax(0,1fr)} .upSt .t{display:none} .upRecap{grid-template-columns:1fr 1fr} }
  </style>`);
  const UI=/* the icons of the phone's upload, as they are */{"upload-minimalistic":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M3 14.25C3.41421 14.25 3.75 14.5858 3.75 15C3.75 16.4354 3.75159 17.4365 3.85315 18.1919C3.9518 18.9257 4.13225 19.3142 4.40901 19.591C4.68577 19.8678 5.07435 20.0482 5.80812 20.1469C6.56347 20.2484 7.56459 20.25 9 20.25H15C16.4354 20.25 17.4365 20.2484 18.1919 20.1469C18.9257 20.0482 19.3142 19.8678 19.591 19.591C19.8678 19.3142 20.0482 18.9257 20.1469 18.1919C20.2484 17.4365 20.25 16.4354 20.25 15C20.25 14.5858 20.5858 14.25 21 14.25C21.4142 14.25 21.75 14.5858 21.75 15V15.0549C21.75 16.4225 21.75 17.5248 21.6335 18.3918C21.5125 19.2919 21.2536 20.0497 20.6517 20.6516C20.0497 21.2536 19.2919 21.5125 18.3918 21.6335C17.5248 21.75 16.4225 21.75 15.0549 21.75H8.94513C7.57754 21.75 6.47522 21.75 5.60825 21.6335C4.70814 21.5125 3.95027 21.2536 3.34835 20.6517C2.74643 20.0497 2.48754 19.2919 2.36652 18.3918C2.24996 17.5248 2.24998 16.4225 2.25 15.0549C2.25 15.0366 2.25 15.0183 2.25 15C2.25 14.5858 2.58579 14.25 3 14.25Z\" opacity=\".5\"/><path d=\"M12 2.25C12.2106 2.25 12.4114 2.33852 12.5535 2.49392L16.5535 6.86892C16.833 7.17462 16.8118 7.64902 16.5061 7.92852C16.2004 8.20802 15.726 8.18678 15.4465 7.88108L12.75 4.9318V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V4.9318L8.55353 7.88108C8.27403 8.18678 7.79963 8.20802 7.49393 7.92852C7.18823 7.64902 7.16698 7.17462 7.44648 6.86892L11.4465 2.49392C11.5886 2.33852 11.7894 2.25 12 2.25Z\"/></g></svg>","videocamera-record":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M17.6582 9.1709C19.6041 8.19795 20.5777 7.7117 21.2891 8.15137C22.0001 8.59119 22 9.67931 22 11.8545V12.1465C22 14.3212 21.9999 15.4088 21.2891 15.8486C20.5777 16.2883 19.6041 15.802 17.6582 14.8291L17 14.5V9.5L17.6582 9.1709Z\"/><path d=\"M12.5 7C13.3284 7 14 7.67157 14 8.5C14 9.32843 13.3284 10 12.5 10C11.6716 10 11 9.32843 11 8.5C11 7.67157 11.6716 7 12.5 7Z\"/><path fill-rule=\"evenodd\" d=\"M2.90796 5.46243C2 6.56878 2 8.21252 2 11.5V12.5C2 15.7875 2 17.4312 2.90796 18.5376C3.07418 18.7401 3.25989 18.9258 3.46243 19.092C4.56878 20 6.21252 20 9.5 20C12.7875 20 14.4312 20 15.5376 19.092C15.7401 18.9258 15.9258 18.7401 16.092 18.5376C17 17.4312 17 15.7875 17 12.5V11.5C17 8.21252 17 6.56878 16.092 5.46243C15.9258 5.25989 15.7401 5.07418 15.5376 4.90796C14.4312 4 12.7875 4 9.5 4C6.21252 4 4.56878 4 3.46243 4.90796C3.25989 5.07418 3.07418 5.25989 2.90796 5.46243Z\" clip-rule=\"evenodd\" opacity=\".5\"/></g></svg>","gallery-wide":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M18.5116 10.0767C18.5116 10.8153 17.8869 11.4142 17.1163 11.4142C16.3457 11.4142 15.7209 10.8153 15.7209 10.0767C15.7209 9.33801 16.3457 8.7392 17.1163 8.7392C17.8869 8.7392 18.5116 9.33801 18.5116 10.0767Z\"/><path fill-rule=\"evenodd\" d=\"M18.0363 5.53205C16.9766 5.39548 15.6225 5.39549 13.9129 5.39551H10.0871C8.37751 5.39549 7.02343 5.39548 5.9637 5.53205C4.87308 5.6726 3.99033 5.96873 3.29418 6.63601C2.59803 7.30329 2.28908 8.14942 2.14245 9.19481C1.99997 10.2106 1.99999 11.5085 2 13.1472V13.2478C1.99999 14.8864 1.99997 16.1843 2.14245 17.2001C2.28908 18.2455 2.59803 19.0916 3.29418 19.7589C3.99033 20.4262 4.87307 20.7223 5.9637 20.8629C7.02344 20.9994 8.37751 20.9994 10.0871 20.9994H13.9129C15.6225 20.9994 16.9766 20.9994 18.0363 20.8629C19.1269 20.7223 20.0097 20.4262 20.7058 19.7589C21.402 19.0916 21.7109 18.2455 21.8575 17.2001C22 16.1843 22 14.8864 22 13.2478V13.1472C22 11.5085 22 10.2106 21.8575 9.19481C21.7109 8.14942 21.402 7.30329 20.7058 6.63601C20.0097 5.96873 19.1269 5.6726 18.0363 5.53205ZM6.14963 6.8576C5.21373 6.97821 4.67452 7.2044 4.28084 7.58175C3.88716 7.95911 3.65119 8.47595 3.52536 9.37303C3.42443 10.0926 3.40184 10.9919 3.3968 12.1682L3.86764 11.7733C4.99175 10.8305 6.68596 10.8846 7.74215 11.897L11.7326 15.7219C12.1321 16.1049 12.7611 16.1571 13.2234 15.8457L13.5008 15.6589C14.8313 14.7626 16.6314 14.8664 17.8402 15.9092L20.2479 17.9862C20.3463 17.7222 20.4206 17.4071 20.4746 17.0219C20.6032 16.1056 20.6047 14.8977 20.6047 13.1975C20.6047 11.4972 20.6032 10.2893 20.4746 9.37303C20.3488 8.47595 20.1128 7.95911 19.7192 7.58175C19.3255 7.2044 18.7863 6.97821 17.8504 6.8576C16.8944 6.73441 15.6343 6.73298 13.8605 6.73298H10.1395C8.36575 6.73298 7.10559 6.73441 6.14963 6.8576Z\" clip-rule=\"evenodd\"/><path d=\"M17.0866 2.61039C16.2268 2.49997 15.1321 2.49998 13.7675 2.5H10.6778C9.31314 2.49998 8.21844 2.49997 7.35863 2.61039C6.46826 2.72473 5.72591 2.96835 5.13712 3.53075C4.79755 3.8551 4.56886 4.22833 4.41309 4.64928C4.91729 4.41928 5.48734 4.28374 6.12735 4.20084C7.21173 4.06037 8.5973 4.06038 10.3466 4.06039H14.2615C16.0108 4.06038 17.3963 4.06037 18.4807 4.20084C19.0397 4.27325 19.5453 4.38581 20.0003 4.56638C19.8457 4.17917 19.6253 3.83365 19.3081 3.53075C18.7193 2.96835 17.977 2.72473 17.0866 2.61039Z\" opacity=\".5\"/></g></svg>","stopwatch":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M12 23C16.9706 23 21 18.9706 21 14C21 9.02944 16.9706 5 12 5C7.02944 5 3 9.02944 3 14C3 18.9706 7.02944 23 12 23Z\" opacity=\".5\"/><path d=\"M12 9.25C12.4142 9.25 12.75 9.58579 12.75 10V14C12.75 14.4142 12.4142 14.75 12 14.75C11.5858 14.75 11.25 14.4142 11.25 14V10C11.25 9.58579 11.5858 9.25 12 9.25Z\"/><path d=\"M14 2C14.4142 2 14.75 2.33579 14.75 2.75C14.75 3.16421 14.4142 3.5 14 3.5H10C9.58579 3.5 9.25 3.16421 9.25 2.75C9.25 2.33579 9.58579 2 10 2H14Z\"/></g></svg>","ruler-angular":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M6 2H8.25H9.75H11.25H12.75H14.25H15.75H17.25L18.75 2.00008C19.9896 2.00126 20.6376 2.02062 21.1111 2.33706C21.3295 2.48298 21.517 2.67048 21.6629 2.88886C22 3.39331 22 4.09554 22 5.5C22 6.90446 22 7.60669 21.6629 8.11114C21.517 8.32952 21.3295 8.51702 21.1111 8.66294C20.6067 9 19.9045 9 18.5 9H11C10.0572 9 9.58579 9 9.29289 9.29289C9 9.58579 9 10.0572 9 11V18.5C9 19.9045 9 20.6067 8.66294 21.1111C8.51702 21.3295 8.32952 21.517 8.11114 21.6629C7.60669 22 6.90446 22 5.5 22C4.09554 22 3.39331 22 2.88886 21.6629C2.67048 21.517 2.48298 21.3295 2.33706 21.1111C2.02062 20.6376 2.00126 19.9896 2.00008 18.75L2 17.25V15.75V14.25V12.75V11.25V9.75V8.25V6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2Z\" opacity=\".5\"/><path d=\"M4 17.25H2L2.00008 18.75H4C4.41421 18.75 4.75 18.4142 4.75 18C4.75 17.5858 4.41421 17.25 4 17.25Z\"/><path d=\"M5 14.25L2 14.25V15.75L5 15.75C5.41421 15.75 5.75 15.4142 5.75 15C5.75 14.5858 5.41421 14.25 5 14.25Z\"/><path d=\"M4 11.25H2V12.75H4C4.41421 12.75 4.75 12.4142 4.75 12C4.75 11.5858 4.41421 11.25 4 11.25Z\"/><path d=\"M5 8.25H2V9.75H5C5.41421 9.75 5.75 9.41421 5.75 9C5.75 8.58579 5.41421 8.25 5 8.25Z\"/><path d=\"M9.75 5L9.75 2H8.25L8.25 5C8.25 5.41421 8.58579 5.75 9 5.75C9.41421 5.75 9.75 5.41421 9.75 5Z\"/><path d=\"M12.75 4V2H11.25V4C11.25 4.41421 11.5858 4.75 12 4.75C12.4142 4.75 12.75 4.41421 12.75 4Z\"/><path d=\"M15.75 5V2H14.25V5C14.25 5.41421 14.5858 5.75 15 5.75C15.4142 5.75 15.75 5.41421 15.75 5Z\"/><path d=\"M18.75 4V2.00008L17.25 2V4C17.25 4.41421 17.5858 4.75 18 4.75C18.4142 4.75 18.75 4.41421 18.75 4Z\"/></g></svg>","file-check":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.23869 2 10.0298 2C10.6358 2 11.1214 2 11.53 2.01666C11.5166 2.09659 11.5095 2.17813 11.5092 2.26057L11.5 5.09497C11.4999 6.19207 11.4998 7.16164 11.6049 7.94316C11.7188 8.79028 11.9803 9.63726 12.6716 10.3285C13.3628 11.0198 14.2098 11.2813 15.0569 11.3952C15.8385 11.5003 16.808 11.5002 17.9051 11.5001L18 11.5001H21.9574C22 12.0344 22 12.6901 22 13.5629V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22Z\" clip-rule=\"evenodd\" opacity=\".5\"/><path d=\"M9.43929 14.502C9.71444 14.1924 10.1883 14.1644 10.4979 14.4395C10.8074 14.7146 10.8355 15.1885 10.5604 15.498L7.89339 18.498C7.75107 18.6581 7.54706 18.75 7.33285 18.75C7.11874 18.7499 6.91455 18.6581 6.7723 18.498L5.43929 16.998C5.16423 16.6885 5.19225 16.2146 5.50179 15.9395C5.81138 15.6644 6.28523 15.6924 6.56039 16.002L7.33285 16.8711L9.43929 14.502Z\"/><path d=\"M11.4998 2.00586C12.0264 2.01725 12.4002 2.05009 12.784 2.14453C12.9402 2.18298 13.1406 2.24407 13.2918 2.29883C13.862 2.50534 14.2784 2.7833 15.1102 3.33887C16.0786 3.98569 17.1891 4.777 17.9998 5.5C18.9108 6.31239 19.9544 7.49387 20.7469 8.44238C20.8744 8.59494 20.9378 8.67168 21.0311 8.79883C21.5612 9.52144 21.9335 10.546 21.9901 11.4404C22 11.5979 21.9998 11.7325 21.9998 12H21.9842C21.978 11.8216 21.9693 11.6555 21.9569 11.5H17.9051C16.808 11.5001 15.838 11.4996 15.0565 11.3945C14.2095 11.2806 13.3629 11.0192 12.6717 10.3281C11.9804 9.63685 11.7182 8.7895 11.6043 7.94238C11.4993 7.16098 11.4998 6.19157 11.4998 5.09473L11.5086 2.25977L11.4998 2.00586Z\"/></g></svg>","sun-2":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z\"/><path fill-rule=\"evenodd\" d=\"M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z\" clip-rule=\"evenodd\"/><g opacity=\".5\"><path d=\"M3.66919 3.7156C3.94869 3.4099 4.42309 3.38867 4.72879 3.66817L6.95081 5.69975C7.25651 5.97925 7.27774 6.45365 6.99824 6.75935C6.71874 7.06505 6.24434 7.08629 5.93865 6.80679L3.71663 4.7752C3.41093 4.4957 3.38969 4.0213 3.66919 3.7156Z\"/><path d=\"M20.3319 3.7156C20.6114 4.0213 20.5902 4.4957 20.2845 4.7752L18.0624 6.80679C17.7567 7.08629 17.2823 7.06505 17.0028 6.75935C16.7233 6.45365 16.7446 5.97925 17.0503 5.69975L19.2723 3.66817C19.578 3.38867 20.0524 3.4099 20.3319 3.7156Z\"/><path d=\"M17.0261 17.0247C17.319 16.7318 17.7938 16.7319 18.0867 17.0248L20.3087 19.2471C20.6016 19.54 20.6016 20.0148 20.3087 20.3077C20.0158 20.6006 19.5409 20.6006 19.248 20.3076L17.026 18.0854C16.7331 17.7924 16.7332 17.3176 17.0261 17.0247Z\"/><path d=\"M6.97521 17.0249C7.2681 17.3177 7.2681 17.7926 6.97521 18.0855L4.75299 20.3077C4.46009 20.6006 3.98522 20.6006 3.69233 20.3077C3.39943 20.0148 3.39943 19.54 3.69233 19.2471L5.91455 17.0248C6.20744 16.732 6.68232 16.732 6.97521 17.0249Z\"/></g></g></svg>","cloud":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><g opacity=\".5\"><path d=\"M3.29688 10.6426C3.58973 10.3498 4.06453 10.3498 4.35742 10.6426C4.6503 10.9355 4.65028 11.4102 4.35742 11.7031L4.1416 11.9189C3.84871 12.2118 3.37395 12.2118 3.08105 11.9189C2.7883 11.626 2.78821 11.1512 3.08105 10.8584L3.29688 10.6426Z\"/><path d=\"M8 4.5C9.933 4.5 11.5 6.067 11.5 8C11.5 9.933 9.933 11.5 8 11.5C6.067 11.5 4.5 9.933 4.5 8C4.5 6.067 6.067 4.5 8 4.5Z\"/><path d=\"M2.5 6.75C2.91421 6.75 3.25 7.08579 3.25 7.5C3.25 7.91421 2.91421 8.25 2.5 8.25H2C1.58579 8.25 1.25 7.91421 1.25 7.5C1.25 7.08579 1.58579 6.75 2 6.75H2.5Z\"/><path d=\"M3.08105 3.08105C3.37395 2.78816 3.84871 2.78816 4.1416 3.08105L4.35742 3.29688C4.65028 3.58977 4.6503 4.06454 4.35742 4.35742C4.06453 4.65017 3.58973 4.65023 3.29688 4.35742L3.08105 4.1416C2.78821 3.84875 2.7883 3.37396 3.08105 3.08105Z\"/><path d=\"M10.8584 3.08105C11.1513 2.78816 11.6261 2.78816 11.9189 3.08105C12.2117 3.37396 12.2118 3.84875 11.9189 4.1416L11.7031 4.35742C11.4103 4.65027 10.9355 4.65018 10.6426 4.35742C10.3497 4.06453 10.3497 3.58977 10.6426 3.29688L10.8584 3.08105Z\"/><path d=\"M7.5 1.25C7.91421 1.25 8.25 1.58579 8.25 2V2.5C8.25 2.91421 7.91421 3.25 7.5 3.25C7.08579 3.25 6.75 2.91421 6.75 2.5V2C6.75 1.58579 7.08579 1.25 7.5 1.25Z\"/></g><path d=\"M16.2857 22C19.4416 22 22 19.4717 22 16.3529C22 13.8811 20.393 11.7802 18.1551 11.015C17.8371 8.19371 15.4159 6 12.4762 6C9.32028 6 6.7619 8.52827 6.7619 11.6471C6.7619 12.3369 6.88706 12.9978 7.11616 13.6089C6.8475 13.5567 6.56983 13.5294 6.28571 13.5294C3.91878 13.5294 2 15.4256 2 17.7647C2 20.1038 3.91878 22 6.28571 22H16.2857Z\"/></g></svg>","cloud-rain":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m12.5 15l-1 2m5.5-2l-1 2m-2.5 2l-1 2M8 15l-1 2m2 2l-1 2m9.478-12.102h.022c2.485 0 4.5 1.98 4.5 4.423A4.4 4.4 0 0 1 20 17m-2.522-8.102q.021-.243.022-.492C17.5 5.421 15.038 3 12 3C9.123 3 6.762 5.171 6.52 7.937m10.958.961a5.33 5.33 0 0 1-1.235 2.949M6.52 7.937C3.984 8.175 2 10.274 2 12.83a4.88 4.88 0 0 0 2 3.932m2.52-8.825q.237-.022.48-.022c1.126 0 2.165.366 3 .983\"/></svg>","wind":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M6.25 5.5C6.25 3.70508 7.70507 2.25 9.5 2.25C11.2949 2.25 12.75 3.70507 12.75 5.5C12.75 7.29493 11.2949 8.75 9.5 8.75H3C2.58579 8.75 2.25 8.41421 2.25 8C2.25 7.58579 2.58579 7.25 3 7.25H9.5C10.4665 7.25 11.25 6.4665 11.25 5.5C11.25 4.5335 10.4665 3.75 9.5 3.75C8.5335 3.75 7.75 4.5335 7.75 5.5V5.85714C7.75 6.27136 7.41421 6.60714 7 6.60714C6.58579 6.60714 6.25 6.27136 6.25 5.85714V5.5Z\" clip-rule=\"evenodd\"/><g opacity=\".5\"><path d=\"M18.5 13.25C20.8472 13.25 22.75 15.1528 22.75 17.5C22.75 19.8472 20.8472 21.75 18.5 21.75C16.1528 21.75 14.25 19.8472 14.25 17.5V17C14.25 16.5858 14.5858 16.25 15 16.25C15.4142 16.25 15.75 16.5858 15.75 17V17.5C15.75 19.0188 16.9812 20.25 18.5 20.25C20.0188 20.25 21.25 19.0188 21.25 17.5C21.25 15.9812 20.0188 14.75 18.5 14.75H4C3.58579 14.75 3.25 14.4142 3.25 14C3.25 13.5858 3.58579 13.25 4 13.25H18.5Z\"/><path d=\"M18.5 3.25C20.8472 3.25 22.75 5.15279 22.75 7.5C22.75 9.84721 20.8472 11.75 18.5 11.75H2C1.58579 11.75 1.25 11.4142 1.25 11C1.25 10.5858 1.58579 10.25 2 10.25H18.5C20.0188 10.25 21.25 9.01878 21.25 7.5C21.25 5.98122 20.0188 4.75 18.5 4.75C16.9812 4.75 15.75 5.98122 15.75 7.5V8C15.75 8.41421 15.4142 8.75 15 8.75C14.5858 8.75 14.25 8.41421 14.25 8V7.5C14.25 5.15279 16.1528 3.25 18.5 3.25Z\"/></g></g></svg>","map-point":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M13.618 21.367A2.37 2.37 0 0 1 12 22a2.37 2.37 0 0 1-1.617-.633C6.412 17.626 1.09 13.447 3.685 7.38C5.09 4.1 8.458 2 12.001 2s6.912 2.1 8.315 5.38c2.592 6.06-2.717 10.259-6.698 13.987Z\"/><path d=\"M15.5 11a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z\"/></g></svg>","calendar-mark":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M16 2v4M8 2v4m5-2h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h2c3.771 0 5.657 0 6.828-1.172S21 17.771 21 14v-2c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4M3 10h18\"/><path d=\"M12.126 14H12m.125 4H12m-4.376-4H7.5m.125 4H7.5m9.125-4H16.5m-4.25 0a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m-4.5-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m0 4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0m9-4a.25.25 0 1 1-.5 0a.25.25 0 0 1 .5 0\"/></g></svg>","check-circle":"<svg viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><path d=\"M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z\" opacity=\".5\"/><path d=\"M16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z\"/></g></svg>","layers-minimalistic":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g fill=\"currentColor\"><g opacity=\".5\"><path d=\"M21.5011 15.4992C21.8095 15.2244 22.2827 15.2511 22.5587 15.5588C22.8349 15.8671 22.8092 16.3409 22.5011 16.6174L22.4992 16.6183L22.4982 16.6203L22.4933 16.6242L22.4796 16.6359C22.4685 16.6455 22.4528 16.6591 22.4337 16.675C22.3957 16.7067 22.342 16.7503 22.2726 16.8039C22.1331 16.9117 21.9298 17.0597 21.6632 17.2326C21.1301 17.5783 20.3426 18.0235 19.2999 18.4406L16.3761 19.6105C14.4994 20.3615 13.3793 20.8088 12.0001 20.8088C10.6209 20.8088 9.50094 20.3615 7.62416 19.6105L4.70033 18.4406C3.65766 18.0235 2.87014 17.5783 2.33705 17.2326C2.07048 17.0597 1.86716 16.9117 1.72767 16.8039C1.65797 16.75 1.60359 16.7067 1.56556 16.675C1.54657 16.6591 1.53174 16.6455 1.52064 16.6359L1.50697 16.6242L1.50209 16.6203L1.50111 16.6183L1.49916 16.6174C1.19132 16.3408 1.16542 15.867 1.44154 15.5588C1.71758 15.2511 2.19078 15.2244 2.49916 15.4992L2.50306 15.5021C2.50749 15.506 2.51556 15.5137 2.52748 15.5236C2.5515 15.5437 2.59056 15.5755 2.64466 15.6174C2.75339 15.7014 2.92265 15.8257 3.15248 15.9748C3.61227 16.273 4.31396 16.6708 5.25697 17.048L8.06556 18.1711C10.0904 18.981 10.9397 19.3088 12.0001 19.3088C13.0605 19.3088 13.9099 18.981 15.9347 18.1711L18.7423 17.048C19.6852 16.6709 20.387 16.273 20.8468 15.9748C21.0767 15.8257 21.2469 15.7014 21.3556 15.6174C21.4097 15.5755 21.4488 15.5436 21.4728 15.5236C21.4848 15.5136 21.4928 15.5059 21.4972 15.5021L21.4992 15.5002L21.5011 15.4992Z\"/><path d=\"M21.5011 11.4396C21.8095 11.165 22.2828 11.1916 22.5587 11.4992C22.8352 11.8075 22.8094 12.2822 22.5011 12.5588L22.4992 12.5597L22.4933 12.5656L22.4796 12.5773C22.4685 12.5869 22.4528 12.5995 22.4337 12.6154C22.3957 12.6472 22.3422 12.6915 22.2726 12.7453C22.1331 12.8531 21.9298 13.0011 21.6632 13.174C21.1302 13.5197 20.3424 13.964 19.2999 14.381L16.4913 15.5051L16.3761 15.551C14.4994 16.3019 13.3793 16.7502 12.0001 16.7502C10.6209 16.7502 9.50094 16.3019 7.62416 15.551L7.50892 15.5051L4.70033 14.381C3.65789 13.964 2.87011 13.5197 2.33705 13.174C2.07056 13.0012 1.86715 12.8531 1.72767 12.7453C1.65792 12.6914 1.60361 12.6472 1.56556 12.6154C1.54669 12.5996 1.53169 12.5869 1.52064 12.5773L1.50697 12.5656L1.50111 12.5597L1.49916 12.5588C1.191 12.2822 1.16509 11.8075 1.44154 11.4992C1.71758 11.1915 2.19078 11.1658 2.49916 11.4406L2.50306 11.4435C2.50754 11.4474 2.51578 11.4543 2.52748 11.464C2.55144 11.484 2.5905 11.5159 2.64466 11.5578C2.75335 11.6418 2.92276 11.7662 3.15248 11.9152C3.61224 12.2134 4.31404 12.6112 5.25697 12.9885L8.06556 14.1125C10.0904 14.9224 10.9397 15.2502 12.0001 15.2502C13.0605 15.2502 13.9099 14.9224 15.9347 14.1125L18.7423 12.9885C19.6854 12.6112 20.387 12.2134 20.8468 11.9152C21.0767 11.7661 21.2469 11.6418 21.3556 11.5578C21.4098 11.5159 21.4488 11.484 21.4728 11.464C21.4845 11.4542 21.4927 11.4474 21.4972 11.4435L21.5011 11.4396Z\"/></g><path d=\"M21.5011 11.4396C21.8095 11.165 22.2828 11.1916 22.5587 11.4992C22.8352 11.8075 22.8094 12.2822 22.5011 12.5588L22.4992 12.5597L22.4933 12.5656L22.4796 12.5773C22.4685 12.5869 22.4528 12.5995 22.4337 12.6154C22.3957 12.6472 22.3422 12.6915 22.2726 12.7453C22.1331 12.8531 21.9298 13.0011 21.6632 13.174C21.1302 13.5197 20.3424 13.964 19.2999 14.381L16.4913 15.5051L16.3761 15.551C14.4994 16.3019 13.3793 16.7502 12.0001 16.7502C10.6209 16.7502 9.50094 16.3019 7.62416 15.551L7.50892 15.5051L4.70033 14.381C3.65789 13.964 2.87011 13.5197 2.33705 13.174C2.07056 13.0012 1.86715 12.8531 1.72767 12.7453C1.65792 12.6914 1.60361 12.6472 1.56556 12.6154C1.54669 12.5996 1.53169 12.5869 1.52064 12.5773L1.50697 12.5656L1.50111 12.5597L1.49916 12.5588C1.191 12.2822 1.16509 11.8075 1.44154 11.4992C1.71758 11.1915 2.19078 11.1658 2.49916 11.4406L2.50306 11.4435C2.50754 11.4474 2.51578 11.4543 2.52748 11.464C2.55144 11.484 2.5905 11.5159 2.64466 11.5578C2.75335 11.6418 2.92276 11.7662 3.15248 11.9152C3.61224 12.2134 4.31404 12.6112 5.25697 12.9885L8.06556 14.1125C10.0904 14.9224 10.9397 15.2502 12.0001 15.2502C13.0605 15.2502 13.9099 14.9224 15.9347 14.1125L18.7423 12.9885C19.6854 12.6112 20.387 12.2134 20.8468 11.9152C21.0767 11.7661 21.2469 11.6418 21.3556 11.5578C21.4098 11.5159 21.4488 11.484 21.4728 11.464C21.4845 11.4542 21.4927 11.4474 21.4972 11.4435L21.5011 11.4396Z\" opacity=\".5\"/><path d=\"M12 3.25C13.3792 3.25 14.4992 3.69828 16.376 4.44922L19.3447 5.63672C20.2993 6.01854 21.0728 6.3282 21.6035 6.60645C21.872 6.74721 22.1324 6.90627 22.333 7.09863C22.5392 7.29638 22.75 7.59658 22.75 8C22.75 8.40342 22.5392 8.70362 22.333 8.90137C22.1324 9.09373 21.872 9.25279 21.6035 9.39355C21.0728 9.6718 20.2993 9.98147 19.3447 10.3633L16.376 11.5508C14.4992 12.3017 13.3792 12.75 12 12.75C10.6208 12.75 9.50081 12.3017 7.62402 11.5508L4.65527 10.3633C3.70069 9.98147 2.92722 9.6718 2.39648 9.39355C2.12801 9.25279 1.86758 9.09373 1.66699 8.90137C1.46083 8.70362 1.25 8.40342 1.25 8C1.25 7.59658 1.46083 7.29638 1.66699 7.09863C1.86758 6.90627 2.12801 6.74721 2.39648 6.60645C2.92723 6.3282 3.70068 6.01854 4.65527 5.63672L7.62402 4.44922C9.50081 3.69828 10.6208 3.25 12 3.25Z\"/></g></svg>","arena-out":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 20.5 5 15H19L21.5 20.5Z\" fill=\"currentColor\" stroke=\"none\" opacity=\".5\"/><path d=\"M2.5 20.5H21.5M2.5 20.5 5 15H19L21.5 20.5M5 15V12.5M9.7 15V12.5M14.3 15V12.5M19 15V12.5M5 13.3H19M9 19.5V16.8M15 19.5V16.8M9 17.6H15\"/><path d=\"M5.5 9H12.5A2.2 2.2 0 0 0 12.3 4.6 3.2 3.2 0 0 0 6.2 5.6 1.8 1.8 0 0 0 5.5 9Z\" opacity=\".5\"/><circle cx=\"17.5\" cy=\"5.5\" r=\"2\"/><path d=\"M17.5 1.8V2.2M21.2 5.5H20.8M14.2 5.5H13.8M20.2 2.8 19.9 3.1M14.8 2.8 15.1 3.1\" opacity=\".5\"/></g></svg>","arena-in":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M11.20 4.15c-0.29 0.03 -0.67 0.07 -0.85 0.10 -0.18 0.03 -0.46 0.08 -0.63 0.10 -0.60 0.09 -1.93 0.53 -2.75 0.93 -2.17 1.05 -3.96 2.78 -4.95 4.81 -0.31 0.63 -0.29 0.96 0.07 1.22 0.23 0.16 0.41 0.18 0.67 0.07 0.21 -0.09 0.25 -0.14 0.41 -0.47 0.75 -1.57 2.06 -2.95 3.84 -4.06 0.18 -0.11 0.48 -0.27 0.67 -0.35 0.20 -0.08 0.38 -0.17 0.40 -0.19 0.11 -0.08 0.77 -0.31 1.23 -0.42 1.96 -0.50 3.40 -0.50 5.27 -0.03 2.67 0.68 5 2.55 6.25 5.02 0.18 0.35 0.23 0.41 0.42 0.49 0.36 0.16 0.71 0.03 0.89 -0.31 0.17 -0.32 0.01 -0.78 -0.57 -1.70 -1.14 -1.84 -2.52 -3.07 -4.51 -4.06 -0.72 -0.35 -2.24 -0.87 -2.77 -0.94 -0.20 -0.03 -0.59 -0.09 -0.86 -0.13 -0.67 -0.10 -1.59 -0.13 -2.23 -0.08z M11.05 5.88c-1.49 0.19 -2.95 0.63 -3.83 1.16 -0.17 0.10 -0.36 0.22 -0.44 0.26 -1.03 0.57 -2.40 1.95 -3.02 3.07 -0.07 0.12 -0.16 0.28 -0.21 0.36 -0.09 0.14 -0.09 0.42 -0.12 3.95l-0.03 3.80 -0.35 0.03c-0.56 0.05 -0.73 0.21 -0.73 0.70 0 0.22 0.03 0.28 0.17 0.44l0.17 0.19 3.35 0.02c3.70 0.01 3.55 0.03 3.79 -0.31 0.10 -0.14 0.11 -0.21 0.13 -2.75l0.03 -2.61 2.03 -0 2.03 -0 0.03 2.61c0.03 2.54 0.03 2.61 0.13 2.75 0.24 0.33 0.11 0.32 3.69 0.32 3.52 -0 3.46 0.01 3.68 -0.28 0.21 -0.26 0.12 -0.84 -0.16 -0.99 -0.06 -0.03 -0.27 -0.07 -0.46 -0.09l-0.35 -0.03 -0.03 -3.78c-0.03 -4.21 0.01 -3.79 -0.39 -4.43 -0.49 -0.80 -1.05 -1.48 -1.66 -2.01 -0.38 -0.33 -1.30 -1.02 -1.37 -1.02 -0.02 -0 -0.18 -0.09 -0.36 -0.20 -0.70 -0.43 -2.02 -0.89 -3.01 -1.05 -0.62 -0.11 -2.25 -0.18 -2.72 -0.12zm2.35 1.44c0.69 0.13 1.49 0.38 2.05 0.64 0.29 0.14 0.53 0.25 0.54 0.25 0.07 -0 1.15 0.76 1.49 1.05 0.39 0.33 0.94 0.94 1.19 1.30 0.07 0.10 0.21 0.30 0.31 0.45l0.19 0.27 -0.01 3.61 -0.02 3.61 -1.83 -0 -1.83 -0 -0.03 -2.64c-0.03 -2.56 -0.03 -2.64 -0.13 -2.77 -0.21 -0.27 -0.25 -0.28 -3.40 -0.26 -3.21 0.02 -3.10 0.01 -3.30 0.34 -0.10 0.17 -0.11 0.27 -0.13 2.75l-0.03 2.58 -1.80 -0 -1.80 -0 -0.02 -3.61 -0.01 -3.61 0.19 -0.27c0.10 -0.15 0.24 -0.34 0.30 -0.43 0.26 -0.38 0.79 -0.97 1.17 -1.29 0.45 -0.38 1.32 -0.99 1.57 -1.10 0.09 -0.04 0.35 -0.16 0.59 -0.27 0.64 -0.30 1.62 -0.56 2.55 -0.68 0.36 -0.05 1.79 0.02 2.20 0.09z M5.82 10.52c-0.50 0.22 -0.47 1.01 0.05 1.20 0.20 0.08 0.79 0.08 6.19 0.07 6.60 -0.02 6.16 0.01 6.39 -0.34 0.21 -0.31 0.08 -0.80 -0.26 -0.94 -0.26 -0.11 -12.12 -0.10 -12.36 0.01z\"/></svg>"};
  const u=(k,px,cls)=>`<span class="ico${cls?' '+cls:''}" style="width:${px}px;height:${px}px">${UI[k]||''}</span>`;
  const TODAYU=new Date(2026,8,30);
  const MONU=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const fmtDay=d=>`${DAYS[d.getDay()]} ${d.getDate()} ${MONU[d.getMonth()].slice(0,3)}`;
  /* the course types, one list in this order for every session (client, v2) */
  const COURSE_TYPES=['Training','Table A','Grand Prix','Jump-Off','Two-Phase','Two-Phase Special','Nations Cup / Team Competition','Accumulator / Joker','Derby','Other'];
  /* every class height, 0.45 m to 1.70 m */
  const HEIGHTS=['0.45 m','0.55 m'].concat(Array.from({length:23},(_,i)=>(0.6+i*0.05).toFixed(2)+' m'));
  const REQ=[{k:'stopwatch',a:'Frame rate',b:'Smooth motion to measure every stride',min:'27 fps min',best:'Best 60 fps'},
    {k:'ruler-angular',a:'Resolution',b:'Enough detail to see the legs',min:'832 × 464 min',best:'Best 1920 × 1080'},
    {k:'videocamera-record',a:'Length',b:'One round, from start to finish',min:'7 s to 3 min',best:''},
    {k:'file-check',a:'File size',b:'Most phone videos are well under',min:'Up to 500 MB',best:''}];
  const STEPS=[['Video',''],['The basics',''],['Conditions','optional'],['How did it feel?','optional']];
  const GEAR_DEF=['Snaffle bit','Pelham','Hackamore','Jumping saddle','Boots','Martingale'];
  const gearList=()=>{ try{ const g=JSON.parse(localStorage.getItem('sdGear')); if(Array.isArray(g)&&g.length) return g; }catch(e){} return GEAR_DEF.slice(); };
  const gearLast=()=>{ try{ const g=JSON.parse(localStorage.getItem('sdGearLast')); if(Array.isArray(g)) return g; }catch(e){} return []; };
  const HERE={c:'Geneva, Switzerland',v:'Your current location'};
  const PLACES=[['Geneva, Switzerland','Palexpo · CHI Geneva'],['Lausanne, Switzerland','Chalet-à-Gobet'],['Zurich, Switzerland','Hallenstadion'],['St. Gallen, Switzerland','Gründenmoos'],
    ['Paris, France','Grand Palais Éphémère'],['Chantilly, France','Domaine de Chantilly'],['Deauville, France','Pôle International du Cheval'],['Lyon, France','Eurexpo'],['Bordeaux, France','Parc des Expositions'],['Gassin, France','Saint-Tropez · Pôle Équestre'],['Cannes, France','Stade des Hespérides'],
    ['Lier, Belgium','Sentower Park'],['Opglabbeek, Belgium','Sentower Park'],['Brussels, Belgium','Brussels Expo'],['Valkenswaard, Netherlands','Tops International Arena'],["'s-Hertogenbosch, Netherlands",'Brabanthallen'],['Amsterdam, Netherlands','RAI'],
    ['Aachen, Germany','Soers · CHIO Aachen'],['Hamburg, Germany','Derby-Park Klein Flottbek'],['London, United Kingdom','Olympia'],['Hickstead, United Kingdom','All England Jumping Course'],['Dublin, Ireland','RDS'],
    ['Vejer de la Frontera, Spain','Sunshine Tour · Dehesa Montenmedio'],['Oliva, Spain','Oliva Nova'],['Madrid, Spain','Club de Campo Villa de Madrid'],['Vienna, Austria','Rathausplatz'],['Monaco','Port Hercule'],
    ['Wellington, United States','Wellington International'],['Calgary, Canada','Spruce Meadows'],['Doha, Qatar','Al Shaqab']];
  const norm=x=>String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const ini=n=>{ const h=((window.SD_DATA||{}).ALL||[]).find(x=>x.n===n||x.n0===n); return h&&h.ini?h.ini:String(n).split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase(); };
  /* the people who ride, for the Stable Owner; the horse's usual rider comes first */
  const RIDERS=['Marie S.','John Doe','Lea Martin'];
  const usualRider=n=>{ const H0=window.SD_H0||{}; const id=Object.keys(H0).find(i=>H0[i][0]===n); return id?H0[id][1]:null; };
  const TIPS=[
    ['<svg viewBox="0 0 92 62"><rect x="0" y="40" width="92" height="22" fill="#2A3A2C"/><rect x="36" y="31" width="4" height="10" fill="#C7CFDB"/><rect x="56" y="31" width="4" height="10" fill="#C7CFDB"/><rect x="34" y="34" width="28" height="2.5" rx="1.2" fill="#fff"/><path d="M70 6h14v10H70z" fill="#5B9BFF"/><circle cx="77" cy="11" r="2.6" fill="#10151D"/><path d="M76 16 58 34" stroke="#5B9BFF" stroke-width="1.2" stroke-dasharray="2 2"/></svg>','From a little higher','A step, a stand or a raised corner, so you see the whole arena.'],
    ['<svg viewBox="0 0 92 62"><rect x="14" y="8" width="64" height="46" rx="6" fill="none" stroke="#5B9BFF" stroke-width="1.6"/><path d="M33 38c2-8 8-12 14-12l6-5 2 3-2 4c2 3 1 7-2 9l1 6h-3l-1-5h-9l-2 5h-3z" fill="#E4E8EE"/></svg>','One horse, in the middle','Follow it smoothly, the whole horse in the picture, no zoom.'],
    ['<svg viewBox="0 0 92 62"><rect x="30" y="6" width="32" height="52" rx="6" fill="none" stroke="#8A94A3" stroke-width="1.4"/><rect x="35" y="16" width="22" height="7" rx="2" fill="#5B9BFF"/><rect x="35" y="27" width="22" height="5" rx="2" fill="#3A4658"/><text x="46" y="21.6" text-anchor="middle" font-size="4.6" font-weight="800" fill="#fff">1080p · 60</text></svg>','1080p at 60 fps, horizontal','iPhone: Settings › Camera › Record Video › 1080p HD at 60 fps.']];

  /* ---------- the sessions waiting for their analysis (this browser tab) ---------- */
  const PK='sdwPending';
  window.SDW_PENDING=()=>{ try{ const L=JSON.parse(sessionStorage.getItem(PK)); return Array.isArray(L)?L:[]; }catch(e){ return []; } };
  const pendSave=L=>{ try{ sessionStorage.setItem(PK,JSON.stringify(L.slice(0,12))); }catch(e){} };
  window.SDW_PENDING_DROP=id=>pendSave(SDW_PENDING().filter(x=>x.id!==id));

  let D=null, st=0, calM=null, locOpen=false, locQ='', gearPre=false, M=null, sending=false, dir=1, opt={};
  const reset=()=>{ calM=null; locOpen=false; locQ=''; sending=false;
    D={locSub:HERE.v,pick:null,file:null,url:null,dur:null,check:null,bad:null,horse:null,rider:null,riderTouched:false,date:'Today',kind:'Training',disc:'Show jumping',height:null,course:null,ttype:null,
      place:'Indoor',loc:HERE.c,ground:null,quality:null,weather:'Sunny',feel:null,tags:[],gear:gearLast(),notes:''}; gearPre=D.gear.length>0; };
  const HN=()=>window.SD_HN||((window.SD_DATA||{}).ALL||[]).map(h=>h.n);
  const OWNER=()=>window.SD_PLAN==='owner';

  /* ---------- small builders ---------- */
  const chips=(key,opts,o)=>{ o=o||{}; return `<div class="chips upChips${o.cls?' '+o.cls:''}" data-k="${key}"${o.multi?' data-m="1"':''} role="${o.multi?'group':'radiogroup'}">${opts.map(x=>{ const [v,l,ico,lg]=Array.isArray(x)?x:[x,x];
      const on=o.multi?D[key].includes(v):D[key]===v;
      return `<button type="button" class="chip${on?' on':''}" data-v="${esc(v)}" role="${o.multi?'checkbox':'radio'}" aria-checked="${on}">${lg?`<span class="lg">${esc(lg)}</span>`:''}${ico?u(ico,16):''}<span>${esc(l)}</span>${o.multi&&on?`<span class="ico ck" style="width:14px;height:14px">${I.check}</span>`:''}</button>`; }).join('')}</div>`; };
  const lab=(t,em)=>`<div class="upLab"><span>${esc(t)}</span>${em?`<em>${esc(em)}</em>`:''}</div>`;

  /* ---------- step 1: the video ---------- */
  function specRows(){ const r=D.check; return REQ.map((q,i)=>{ const s=r&&r[i], ok=s&&s.ok;
    return `<div class="upSp${s&&s.ok===false?' bad':''}"><span class="ri">${u(q.k,18)}</span><div class="t"><b>${esc(q.a)}</b><span>${esc(s&&s.txt?s.txt:q.b)}</span></div>
      ${s&&s.ok!==null?`<span class="st ${ok?'good':'bad'}">${ok?`<span class="ico" style="width:14px;height:14px">${I.check}</span>`:'!'}</span>`:`<div class="v"><b>${esc(q.min)}</b>${q.best?`<span>${esc(q.best)}</span>`:''}</div>`}</div>`; }).join(''); }
  function verdict(){ if(!D.file) return ''; if(D.bad) return `<span class="bad">${esc(D.bad)}</span>`;
    if(!D.check) return `<span class="mut">${esc(T('Checking the video…'))}</span>`;
    const n=D.check.filter(x=>x.ok===false).length;
    return n?`<span class="bad"><b>${n>1?esc(`${n} things to fix.`):esc('1 thing to fix.')}</b></span> <span class="mut">${esc('See the list on the right.')}</span>`:`<span class="good"><b>Looks good.</b></span> <span class="mut">Ready for the next step.</span>`; }
  function step0(){
    const size=D.file&&D.file.size?(D.file.size/1048576):null;
    return `<div class="upG2 v">
      <div>${D.file?`<div class="upPick">
          <div class="pv">${D.url?`<video src="${D.url}" muted playsinline preload="metadata"></video>`:`<span class="ph">${u('gallery-wide',30)}</span>`}${D.dur?`<span class="du num">${esc(D.dur)}</span>`:''}</div>
          <div class="pb">${u('gallery-wide',20,'blue')}<span class="t"><b title="${esc(D.file.name)}">${esc(D.file.name)}</b><span class="num">${size!=null?(size<10?size.toFixed(1):Math.round(size))+' MB':''}${D.dur?' · '+esc(D.dur):''}</span></span><button type="button" class="btn sm" id="upChange">Change</button></div>
          <div class="upVer" id="upVer">${verdict()}</div></div>`
        :`<label class="upDrop" id="upDrop" tabindex="0"><span class="big">${u('upload-minimalistic',28)}</span>
          <b>Drop the video of the round here</b><span class="mut">or choose a file on this computer</span>
          <span class="btn pri sm" style="margin-top:6px">${u('gallery-wide',16)}<span>Choose a video</span></span>
          <span class="dim" style="font-size:12px;margin-top:2px">One horse, one round, 7 s to 3 min.</span></label>`}
        <input type="file" accept="video/*" id="upFile" hidden></div>
      <div><div class="lbl" style="margin-bottom:10px">WHAT YOUR VIDEO NEEDS</div><div class="upSpec">${specRows()}</div></div></div>
    <div class="lbl" style="margin:24px 0 10px">HOW TO FILM A GOOD SESSION</div>
    <div class="upTips">${TIPS.map(([s,a,b])=>`<div class="upTip"><span class="ill">${s}</span><div><b>${esc(a)}</b><span>${esc(b)}</span></div></div>`).join('')}</div>`; }
  function takeFile(f){ if(!f) return;
    if(D.url) try{ URL.revokeObjectURL(D.url); }catch(e){}
    D.file=f; D.check=null; D.dur=null; D.bad=null; D.url=null;
    if(f.type&&!/^video\//.test(f.type)&&!/\.(mov|mp4|m4v|avi|mkv|webm|3gp|hevc)$/i.test(f.name)){ D.bad=T('This file is not a video. Pick the video of the round.'); render(false); return; }
    D.url=URL.createObjectURL(f); render(false);
    const mb=f.size/1048576, v=document.createElement('video'); v.preload='metadata'; v.muted=true;
    const done=(w,h,d)=>{ if(D.check||D.file!==f) return; const known=!!(w&&d);
      D.dur=known?`${Math.floor(d/60)}:${String(Math.round(d%60)).padStart(2,'0')}`:'';
      D.check=[{ok:null,txt:'Checked during the analysis'},
        {ok:known?(Math.max(w,h)>=832&&Math.min(w,h)>=464):null,txt:known?`${w} × ${h}${Math.min(w,h)>=1080?' · perfect':''}`:''},
        {ok:known?(d>=7&&d<=180):null,txt:known?D.dur+(d<7?' · too short':d>180?' · too long, trim it to one round':''):''},
        {ok:mb<=500,txt:`${mb<10?mb.toFixed(1):Math.round(mb)} MB`+(mb>500?' · too big':'')}];
      if(st===0) render(false); else foot(); };
    v.onloadedmetadata=()=>done(v.videoWidth,v.videoHeight,v.duration); v.onerror=()=>done(0,0,0);
    v.src=D.url; setTimeout(()=>done(0,0,0),2500); }

  /* ---------- step 2: the basics ---------- */
  function calendar(){
    if(!calM) calM=new Date((D.pick||TODAYU).getFullYear(),(D.pick||TODAYU).getMonth(),1);
    const y=calM.getFullYear(), m=calM.getMonth(), first=(new Date(y,m,1).getDay()+6)%7, n=new Date(y,m+1,0).getDate();
    const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
    const canNext=new Date(y,m+1,1)<=TODAYU;
    let cells=''; for(let i=0;i<first;i++) cells+='<span></span>';
    for(let d=1;d<=n;d++){ const dt=new Date(y,m,d), fut=dt>TODAYU; cells+=`<button type="button" class="${same(dt,D.pick)?'on':''}${same(dt,TODAYU)?' td':''}" data-d="${d}"${fut?' disabled':''}>${d}</button>`; }
    return `<div class="upCal"><div class="h"><button type="button" class="cn" data-c="-1" aria-label="Previous month">${W.ic(I.chevR,16,'flip')}</button>
      <b>${esc(MONU[m])} ${y}</b><button type="button" class="cn" data-c="1" aria-label="Next month"${canNext?'':' disabled'}>${W.ic(I.chevR,16)}</button></div>
      <div class="w">${Array.from({length:7},(_,i)=>new Date(2026,0,5+i).toLocaleDateString(window.SD_LANG||'en',{weekday:'narrow'})).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="g">${cells}</div>
      <div class="s">${D.pick?`<span>${esc(fmtDay(D.pick))}</span> · <span>${esc(`${Math.round((TODAYU-D.pick)/864e5)} days ago`)}</span>`:esc('Click the day of the session')}</div></div>`; }
  function step1(){ const hn=HN();
    return `<div class="upG2">
      <div>${lab('HORSE')}${chips('horse',hn.map(n=>[n,n,null,ini(n)]),{cls:'hz'})}
        ${OWNER()?lab('RIDER',D.horse&&D.rider&&!D.riderTouched?'usual rider':'')+chips('rider',RIDERS.map(n=>[n,n,null,ini(n)]),{cls:'hz'}):''}
        ${lab('WHEN')}${chips('date',[['Today','Today','calendar-mark'],['Yesterday','Yesterday'],['Other day',D.pick?fmtDay(D.pick):'Other day…']])}
        ${D.date==='Other day'?calendar():''}</div>
      <div>${lab('SESSION')}<div class="seg upSeg" data-k="kind" role="radiogroup">${['Training','Show'].map(x=>`<button type="button" class="${D.kind===x?'on':''}" data-v="${x}" role="radio" aria-checked="${D.kind===x}"><span class="ico" style="width:16px;height:16px">${W.kindIcon(x==='Show')}</span>${esc(x)}</button>`).join('')}</div>
        ${lab('DISCIPLINE')}${chips('disc',['Show jumping','Flatwork'])}
        ${D.kind==='Show'?lab('CLASS HEIGHT')+chips('height',HEIGHTS,{cls:'hts'})+lab('COURSE TYPE')+chips('course',COURSE_TYPES)
          :lab('COURSE TYPE','optional')+chips('ttype',COURSE_TYPES)}</div></div>`; }

  /* ---------- step 3: conditions ---------- */
  function locList(){
    const q=norm(locQ.trim()), L=q?PLACES.filter(([c,v])=>norm(c+' '+v).includes(q)).slice(0,8):PLACES.slice(0,5);
    const row=(c,v,here)=>`<button type="button" class="upLocR${D.loc===c&&D.locSub===v?' on':''}" data-c="${esc(c)}" data-v="${esc(v)}">${u('map-point',17,here?'blue':'')}<span class="t"><b>${esc(c)}</b><small>${esc(v)}</small></span>${D.loc===c&&D.locSub===v?`<span class="ico ck" style="width:16px;height:16px">${I.check}</span>`:''}</button>`;
    return (q?'':`<div class="gl">NEAR YOU</div>${row(HERE.c,HERE.v,true)}<div class="gl">POPULAR SHOW GROUNDS</div>`)
      +(L.length?L.map(([c,v])=>row(c,v,false)).join(''):`<div class="upLocE"><span>No place found. Keep typing, or</span> <button type="button" class="btn link upLocFree" data-c="${esc(locQ)}">use “${esc(locQ)}”</button></div>`); }
  function step2(){
    const WX=[['Sunny','Sunny','sun-2'],['Cloudy','Cloudy','cloud'],['Rain','Rain','cloud-rain'],['Windy','Windy','wind']];
    return `<div class="upG2">
      <div>${lab('WHERE')}<div class="upWhere">${u('map-point',20,'blue')}<div class="t"><b>${esc(D.loc)}</b><span>${esc(D.locSub)}</span></div><button type="button" class="btn sm" id="upLoc">${locOpen?'Close':'Change'}</button></div>
        ${locOpen?`<div class="upLocS"><label class="box">${W.I.search}<input id="upLocQ" placeholder="Search a city or a show ground" value="${esc(locQ)}" autocomplete="off" spellcheck="false"></label><div id="upLocL" class="upLocL">${locList()}</div></div>`:''}
        ${lab('ARENA')}${chips('place',[['Indoor','Indoor','arena-in'],['Outdoor','Outdoor','arena-out']])}</div>
      <div>${lab('GROUND')}${chips('ground',['Sand','Grass','Fibre','Clay'])}
        ${lab('GROUND FEELS')}${chips('quality',['Soft','Good','Firm','Deep'])}
        ${D.place==='Outdoor'?lab('WEATHER','auto')+chips('weather',WX):''}</div></div>`; }

  /* ---------- step 4: how did it feel? ---------- */
  function step3(){ const F=['Tough','Hard','OK','Good','Great'];
    return `<div class="upG2">
      <div>${lab('OVERALL')}<div class="upFeel" data-k="feel" role="radiogroup">${F.map((f,i)=>`<button type="button" class="${D.feel===f?'on':''}" data-v="${f}" role="radio" aria-checked="${D.feel===f}"><span class="m">${[0,1,2,3,4].map(k=>`<i class="${k<=i?'f':''}"></i>`).join('')}</span><span>${esc(f)}</span></button>`).join('')}</div>
        ${lab('THE HORSE WAS','several')}${chips('tags',['Relaxed','Forward','Rushing','Stiff','Spooky','Tired','Listening'],{multi:true})}
        ${lab('NOTES')}<textarea class="upIn" id="upNotes" rows="4" placeholder="Anything to remember about this round…">${esc(D.notes)}</textarea></div>
      <div>${lab('EQUIPMENT','several')}${chips('gear',[...new Set(gearList().concat(D.gear))],{multi:true})}
        ${gearPre?`<div class="upPre">${W.ic(I.info,14)}<span>Same as last time, change it if needed</span></div>`:''}
        <div class="upGearAdd"><input class="upIn" id="upGearIn" placeholder="Add your own, e.g. Dutch gag" autocomplete="off"><button type="button" class="btn" id="upGearGo">Add</button></div></div></div>`; }

  /* ---------- the frame: steps on top, the page, the buttons ---------- */
  const okStep=()=>{ if(st===0) return !!D.file&&!D.bad&&!(D.check&&D.check.some(x=>x.ok===false));
    if(st===1) return !!D.horse&&(!OWNER()||!!D.rider)&&(D.date!=='Other day'||!!D.pick)&&(D.kind!=='Show'||(D.height&&D.course)); return true; };
  const hint=()=>{ if(st===0) return D.file?(D.bad||(D.check&&D.check.some(x=>x.ok===false))?'Fix the video, or pick another one':''):'Add a video to continue';
    if(st===1) return !D.horse?'Pick the horse':OWNER()&&!D.rider?'Pick the rider':(D.date==='Other day'&&!D.pick?'Pick the day in the calendar':(D.kind==='Show'&&!(D.height&&D.course)?'Pick the class height and the course':''));
    return st>=2?'Optional: skip it if you are in a hurry':''; };
  function stepper(){ const box=M&&M.querySelector('.upSteps'); if(!box) return;
    box.innerHTML=STEPS.map(([a,b],i)=>`<button type="button" class="upSt${i===st?' on':''}${i<st?' done':''}" data-i="${i}"${i<st&&!sending?'':' tabindex="-1"'} aria-current="${i===st?'step':'false'}">
      <span class="n">${i<st?`<span class="ico" style="width:13px;height:13px">${I.check}</span>`:i+1}</span><span class="t"><b>${esc(a)}</b>${b?`<small>${esc(b)}</small>`:''}</span></button>`).join('<i class="ln"></i>');
    box.querySelectorAll('.upSt.done').forEach(b=>b.onclick=()=>{ if(sending) return; dir=-1; st=+b.dataset.i; render(); }); }
  function foot(){ const f=M&&M.querySelector('.mF'); if(!f) return;
    if(sending){ f.innerHTML=''; return; }
    const h=hint(), ok=okStep();
    f.innerHTML=`<span class="upHint${ok?'':' need'}">${h?esc(h):''}</span>
      ${st?`<button type="button" class="btn ghost" id="upBack">${W.ic(I.chevR,16,'flip')}<span>Back</span></button>`:''}
      ${st>=2?`<button type="button" class="btn" id="upSkip">Skip</button>`:''}
      <button type="button" class="btn pri" id="upNext"${ok?'':' disabled'}>${st===3?`${u('upload-minimalistic',16)}<span>Analyse this session</span>`:`<span>Continue</span>${W.ic(I.chevR,16)}`}</button>`;
    const nx=f.querySelector('#upNext'), bk=f.querySelector('#upBack'), sk=f.querySelector('#upSkip');
    nx.onclick=()=>{ if(!okStep()) return; if(st<3){ dir=1; st++; render(); } else send(); };
    if(bk) bk.onclick=()=>{ dir=-1; st--; render(); };
    if(sk) sk.onclick=()=>{ if(st<3){ dir=1; st++; render(); } else send(); }; }
  function render(top){
    if(!M) return; const B=M.querySelector('.mB');
    stepper();
    const html=[step0,step1,step2,step3][st]();
    B.innerHTML=`<div class="upPg">${html}</div>`;
    if(top!==false){ B.scrollTop=0; if(!RM()) B.firstElementChild.animate([{opacity:0,transform:`translateX(${dir*14}px)`},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.23,1,.32,1)'}); }
    wire(B); foot(); }
  function wire(B){
    B.querySelectorAll('.upChips').forEach(c=>c.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{ const k=c.dataset.k, v=b.dataset.v;
      if(c.dataset.m){ const a=D[k]; a.includes(v)?a.splice(a.indexOf(v),1):a.push(v); if(k==='gear') gearPre=false; }
      else D[k]=D[k]===v&&!['date','disc','place','horse','rider'].includes(k)?null:v;
      if(k==='horse'&&OWNER()&&!D.riderTouched) D.rider=usualRider(D.horse);
      if(k==='rider') D.riderTouched=true;
      if(k==='date'&&v!=='Other day') calM=null;
      const sc=B.scrollTop; render(false); B.scrollTop=sc; }));
    B.querySelectorAll('.upSeg,.upFeel').forEach(c=>c.querySelectorAll('button').forEach(b=>b.onclick=()=>{ D[c.dataset.k]=b.dataset.v; const sc=B.scrollTop; render(false); B.scrollTop=sc; }));
    const cal=B.querySelector('.upCal'); if(cal){
      cal.querySelectorAll('.cn').forEach(b=>b.onclick=()=>{ if(b.disabled) return; calM=new Date(calM.getFullYear(),calM.getMonth()+ +b.dataset.c,1); const sc=B.scrollTop; render(false); B.scrollTop=sc; });
      cal.querySelectorAll('.g button').forEach(b=>b.onclick=()=>{ if(b.disabled) return; D.pick=new Date(calM.getFullYear(),calM.getMonth(),+b.dataset.d); const sc=B.scrollTop; render(false); B.scrollTop=sc; }); }
    /* the video */
    const fi=B.querySelector('#upFile'), dz=B.querySelector('#upDrop'), ch=B.querySelector('#upChange');
    if(fi) fi.onchange=()=>{ if(fi.files[0]) takeFile(fi.files[0]); fi.value=''; };
    if(dz){ dz.onclick=e=>{ e.preventDefault(); fi.click(); }; dz.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fi.click(); } }; }
    if(ch) ch.onclick=()=>fi.click();
    /* where */
    const lb=B.querySelector('#upLoc'); if(lb) lb.onclick=()=>{ locOpen=!locOpen; locQ=''; render(false); if(locOpen) setTimeout(()=>{ const q=document.getElementById('upLocQ'); if(q) q.focus(); },40); };
    const lq=B.querySelector('#upLocQ'); const wl=()=>B.querySelectorAll('.upLocR,.upLocFree').forEach(b=>b.onclick=()=>{ D.loc=b.dataset.c; D.locSub=b.dataset.v||'Added by you'; locOpen=false; render(false); });
    if(lq){ lq.oninput=()=>{ locQ=lq.value; B.querySelector('#upLocL').innerHTML=locList(); wl(); }; wl(); }
    /* notes, equipment */
    const nt=B.querySelector('#upNotes'); if(nt) nt.oninput=()=>D.notes=nt.value;
    const gi=B.querySelector('#upGearIn'), gg=B.querySelector('#upGearGo');
    if(gi){ const add=()=>{ const v=gi.value.trim().replace(/\s+/g,' '); if(!v) return; const L=gearList();
        if(!L.some(x=>x.toLowerCase()===v.toLowerCase())) L.push(v); try{ localStorage.setItem('sdGear',JSON.stringify(L)); }catch(e){}
        const name=L.find(x=>x.toLowerCase()===v.toLowerCase()); if(!D.gear.includes(name)) D.gear.push(name); gearPre=false; render(false); const g2=document.getElementById('upGearIn'); if(g2) g2.focus(); };
      gg.onclick=add; gi.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } }; } }

  /* ---------- sent: the upload bar, then the analysis starts ---------- */
  function send(){ sending=true; st=4; const B=M.querySelector('.mB');
    stepper(); M.querySelector('.upSteps').classList.add('sent');
    const when=D.date==='Other day'&&D.pick?fmtDay(D.pick):D.date, what=D.kind==='Show'?`${D.height} · ${D.course}`:(D.ttype&&D.ttype!=='Training'?D.ttype:D.disc);
    B.innerHTML=`<div class="upSent"><span class="ok">${u('upload-minimalistic',30)}</span>
      <h2 id="upSH">${esc(`Uploading ${D.horse}'s round`)}</h2>${D.rider?`<p class="mut">${esc(`Ridden by ${D.rider}`)}</p>`:''}
      <div class="upRecap"><div><span class="lbl">HORSE</span><b>${esc(D.horse)}</b></div><div><span class="lbl">WHEN</span><b>${esc(when)}</b></div>
        <div><span class="lbl">SESSION</span><b>${esc(D.kind)}</b><small>${esc(what)}</small></div><div><span class="lbl">WHERE</span><b>${esc(D.loc.split(',')[0])}</b><small>${esc(D.place)}</small></div></div>
      <div class="upBar"><i id="upProg"></i></div><p class="upPct num" id="upPct">0%</p>
      <p class="mut upLeave" id="upLeave">You can leave this screen, we'll tell you when the analysis is ready.</p>
      <div class="upDoneB" id="upDoneB"></div></div>`;
    if(!RM()) B.firstElementChild.animate([{opacity:0,transform:'scale(.98)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.23,1,.32,1)'});
    foot();
    const rec={id:'u'+Date.now().toString(36),horse:D.horse,rider:D.rider||usualRider(D.horse),when,date:(D.date==='Other day'&&D.pick?D.pick:new Date(TODAYU.getTime()-(D.date==='Yesterday'?864e5:0))).toISOString(),
      kind:D.kind,disc:D.disc,height:D.height,course:D.kind==='Show'?D.course:(D.ttype||null),place:D.place,loc:D.loc,locSub:D.locSub,dur:D.dur||'',file:D.file&&D.file.name,feel:D.feel,notes:D.notes,t0:0};
    let p=0; const mine=M;
    const t=setInterval(()=>{ p=Math.min(100,p+4+Math.random()*9);
      const g=document.getElementById('upProg'), c=document.getElementById('upPct');
      if(g) g.style.width=p+'%'; if(c) c.textContent=p<100?Math.round(p)+'%':T('Sent · analysing the round');
      if(p>=100){ clearInterval(t);
        try{ localStorage.setItem('sdGearLast',JSON.stringify(D.gear)); localStorage.setItem('sdLastFeel',JSON.stringify({horse:D.horse,when,kind:D.kind,height:D.height,course:D.course,feel:D.feel,tags:D.tags,gear:D.gear,notes:D.notes,place:D.place,loc:D.loc,ground:D.ground,quality:D.quality,weather:D.place==='Outdoor'?D.weather:null})); }catch(e){}
        rec.t0=Date.now(); pendSave([rec].concat(SDW_PENDING()));
        const h=document.getElementById('upSH'); if(h&&M===mine) h.textContent=T('Sent · analysing the round');
        const ok=M===mine&&M.querySelector('.upSent .ok'); if(ok){ ok.classList.add('done'); ok.innerHTML=u('check-circle',34); }
        setTimeout(()=>finish(rec,mine),1100); } },160); }
  function finish(rec,mine){ const open=M===mine&&mine.isConnected;
    if(open){ W.closeModal(); M=null; }
    const go=()=>{ if(typeof opt.onDone==='function') return opt.onDone(rec);
      if(typeof window.SDW_ON_UPLOAD==='function') return window.SDW_ON_UPLOAD(rec);
      const u=new URL('sessions.html',location.href), pl=new URLSearchParams(location.search).get('plan'); if(pl) u.searchParams.set('plan',pl); u.hash='new='+rec.id; location.href=u.toString(); };
    setTimeout(go,open&&!RM()?220:0); }

  /* ---------- open ---------- */
  window.SDW_UPLOAD_FULL=function(o){ opt=o||{}; reset(); st=0; dir=1;
    if(opt.horse&&HN().includes(opt.horse)){ D.horse=opt.horse; if(OWNER()) D.rider=usualRider(opt.horse); }
    if(opt.kind==='Show') D.kind='Show';
    M=W.modal({title:T('Add a session'),sub:esc(T('We check the video right away, before anything is sent.')),wide:true,body:'',foot:'<span></span>',
      icon:`<span class="ico" style="width:40px;height:40px;border-radius:11px;background:var(--blue-bg);color:var(--blue-ink);padding:9px">${UI['upload-minimalistic']}</span>`});
    M.classList.add('upM');
    M.querySelector('.mH').insertAdjacentHTML('afterend','<div class="upSteps" role="list"></div>');
    /* a file dropped anywhere on the dialog, on the first step */
    M.addEventListener('dragover',e=>{ if(st!==0||sending) return; e.preventDefault(); const z=M.querySelector('.upDrop,.upPick'); if(z) z.classList.add('over'); });
    M.addEventListener('dragleave',e=>{ if(e.relatedTarget&&M.contains(e.relatedTarget)) return; M.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); });
    M.addEventListener('drop',e=>{ if(st!==0||sending) return; e.preventDefault(); M.querySelectorAll('.over').forEach(x=>x.classList.remove('over')); const f=e.dataTransfer&&e.dataTransfer.files[0]; if(f) takeFile(f); });
    render(); return M; };
  /* test hook: a picked file without the file dialog (Playwright and the demo) */
  window.SDW_UPLOAD_TAKE=f=>{ if(M&&st===0) takeFile(f); };
})();
