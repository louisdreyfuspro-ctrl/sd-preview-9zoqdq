/* StrydeUp, care & visits of a horse.
   Who came (vet, osteopath, farrier…) and when, kept per horse; shown on the horse page as a calendar,
   and on the Trends chart as markers, with the average before and after each visit so you can see if it changed anything.
   Icons: Solar (CC BY 4.0), Phosphor (MIT), Material Design Icons (Apache 2.0), Healthicons (MIT), Hugeicons (MIT). */
(function(){
  const IC={"vet": ["0 0 24 24", "<g fill=\"currentColor\"><path d=\"M19 13C20.6569 13 22 14.3431 22 16C22 17.6569 20.6569 19 19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13Z\"/><path d=\"M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V2.25098C12.8612 2.25266 12.9564 2.25682 13.0449 2.26465C14.8549 2.42486 16.2901 3.85988 16.4502 5.66992C16.4648 5.83529 16.4639 6.02272 16.4639 6.29785V7.52148C16.4636 11.6437 13.1223 14.9854 9 14.9854C4.71982 14.9853 1.25003 11.5155 1.25 7.23535V6.29785C1.24997 6.02269 1.25004 5.83531 1.26465 5.66992C1.42472 3.85978 2.85978 2.42472 4.66992 2.26465C4.82554 2.2509 5.00063 2.25002 5.25 2.25V2C5.25 1.58579 5.58579 1.25 6 1.25C6.41422 1.25 6.75 1.58579 6.75 2V4C6.75 4.41421 6.41422 4.75 6 4.75C5.58579 4.75 5.25 4.41421 5.25 4V3.75C4.9866 3.75018 4.88387 3.75153 4.80176 3.75879C3.71572 3.85486 2.85485 4.71571 2.75879 5.80176C2.75078 5.89235 2.75 6.00803 2.75 6.33691V7.23535C2.75003 10.6871 5.54825 13.4853 9 13.4854C12.2938 13.4854 14.9636 10.8153 14.9639 7.52148V6.33691C14.9639 6.00803 14.9631 5.89235 14.9551 5.80176C14.859 4.71571 13.9982 3.85483 12.9121 3.75879C12.8699 3.75507 12.8222 3.75318 12.75 3.75195V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25Z\"/><path d=\"M8.25 14.9496V17.0002C8.25 20.1759 10.8244 22.7502 14 22.7502H14.8824C16.6952 22.7502 18.2756 21.7588 19.1126 20.2922C19.3594 19.8596 19.4822 19.3964 19.542 18.9513C19.3662 18.9834 19.1851 19.0002 19 19.0002C18.6649 19.0002 18.3426 18.9452 18.0417 18.8438C17.9986 19.1109 17.926 19.345 17.8098 19.5487C17.2289 20.5667 16.135 21.2502 14.8824 21.2502H14C11.6528 21.2502 9.75 19.3474 9.75 17.0002V14.9482C9.50334 14.9729 9.25314 14.9855 9.00001 14.9855C8.74699 14.9855 8.4968 14.9733 8.25 14.9496Z\" opacity=\".5\"/></g>"], "osteo": ["0 0 24 24", "<g fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M13.2895 5.7897C13.0092 4.77646 13.3942 3.48102 14.1374 2.73779C15.1212 1.75407 16.7161 1.75407 17.6998 2.73779C18.6835 3.72152 18.6835 5.31646 17.6998 6.30018C18.6835 5.31646 20.2785 5.31646 21.2622 6.30018C22.2459 7.28391 22.2459 8.87884 21.2622 9.86257C20.519 10.6058 19.2235 10.9908 18.2103 10.7105C17.674 10.562 17.0246 10.5378 16.6311 10.9313L13.0687 7.3689C13.4622 6.97541 13.438 6.32603 13.2895 5.7897ZM7.3689 13.0687C6.97541 13.4622 6.32603 13.438 5.7897 13.2895C4.77646 13.0092 3.48101 13.3942 2.73779 14.1374C1.75407 15.1212 1.75407 16.7161 2.73779 17.6998C3.72152 18.6835 5.31646 18.6835 6.30018 17.6998C5.31646 18.6835 5.31645 20.2785 6.30018 21.2622C7.28391 22.2459 8.87884 22.2459 9.86257 21.2622C10.6058 20.519 10.9908 19.2235 10.7105 18.2103C10.562 17.674 10.5378 17.0246 10.9313 16.6311L7.3689 13.0687Z\" clip-rule=\"evenodd\"/><path d=\"M10.9315 16.6313L16.6313 10.9315L13.069 7.36914L7.36914 13.069L10.9315 16.6313Z\" opacity=\".5\"/></g>"], "farrier": ["0 0 24 24", "<path fill=\"currentColor\" d=\"M19 4h1V1h-4v3s2 4 2 8s-2 7-6 7s-6-3-6-7s2-8 2-8V1H4v3h1S2 8 2 14c0 5 5 9 10 9s10-4 10-9c0-6-3-10-3-10M4 13c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2 6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6 3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m6-3c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1m2-6c-.6 0-1-.4-1-1s.4-1 1-1s1 .4 1 1s-.4 1-1 1\"/>"], "dentist": ["0 0 24 24", "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M9 6c.5.5 1.503.412 3-.824m0 0q-.332-.272-.689-.626c-2.306-2.284-5.446-1.837-6.917 0C3.378 5.82.778 8.98 7.142 20.24c.264.466.789.76 1.354.76c.902 0 1.607-.72 1.636-1.56c.063-1.782.408-3.837 1.868-3.837s1.806 2.055 1.868 3.837c.029.84.734 1.56 1.636 1.56c.565 0 1.09-.294 1.354-.76c6.365-11.261 3.764-14.42 2.748-15.69c-1.471-1.837-4.611-2.284-6.917 0q-.357.353-.689.626\"/>"], "physio": ["0 0 24 24", "<g fill=\"currentColor\"><path d=\"M7 4.82936C7 6.37714 8.72593 8.00761 10.1497 9.08932C10.9489 9.69644 11.3484 10 12 10C12.6516 10 13.0512 9.69644 13.8503 9.08933C15.2741 8.00763 17 6.37717 17 4.82935C17 2.03918 14.2499 0.997463 12 3.15285C9.75008 0.997463 7 2.03918 7 4.82936Z\"/><path d=\"M6.25993 21.3884H6C5.05719 21.3884 4.58579 21.3884 4.29289 21.0955C4 20.8026 4 20.3312 4 19.3884V18.2764C4 17.7579 4 17.4987 4.13318 17.2672C4.26636 17.0356 4.46727 16.9188 4.8691 16.6851C7.51457 15.1464 11.2715 14.2803 13.7791 15.7759C13.9475 15.8764 14.0991 15.9977 14.2285 16.1431C14.7866 16.77 14.746 17.7161 14.1028 18.2775C13.9669 18.396 13.8222 18.486 13.6764 18.5172C13.7962 18.5033 13.911 18.4874 14.0206 18.4699C14.932 18.3245 15.697 17.8375 16.3974 17.3084L18.2046 15.9433C18.8417 15.462 19.7873 15.4619 20.4245 15.943C20.9982 16.3762 21.1736 17.0894 20.8109 17.6707C20.388 18.3487 19.7921 19.216 19.2199 19.7459C18.6469 20.2766 17.7939 20.7504 17.0975 21.0865C16.326 21.4589 15.4738 21.6734 14.6069 21.8138C12.8488 22.0983 11.0166 22.0549 9.27633 21.6964C8.29253 21.4937 7.27079 21.3884 6.25993 21.3884Z\" opacity=\".5\"/></g>"], "chiro": ["0 0 48 48", "<g fill=\"currentColor\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"><path d=\"M14.75 7.229c0-1.274 1.166-2.205 2.393-1.97c5.198.994 8.516 1.006 13.71.003c1.227-.237 2.397.694 2.397 1.97v.414H34a2 2 0 0 1 2 2v1.528a2 2 0 0 1-2 2h-.75v.878a1.99 1.99 0 0 1-1.498 1.931c-2.854.727-5.224 1.101-7.65 1.1c-2.424 0-4.856-.376-7.834-1.103a1.99 1.99 0 0 1-1.518-1.937v-.869H14a2 2 0 0 1-2-2V9.646a2 2 0 0 1 2-2h.75zm2 0v.417a2 2 0 0 1-2 2H14v1.528h.75a2 2 0 0 1 2 2v.865c2.886.704 5.147 1.044 7.353 1.044c2.203.001 4.397-.336 7.147-1.035v-.874a2 2 0 0 1 2-2H34V9.646h-.75a2 2 0 0 1-2-2v-.414l-.002-.002l-.008-.004h-.008c-5.448 1.052-9.022 1.039-14.465-.003h-.008l-.007.004z\"/><path d=\"M19 9a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m-4.25 11.229c0-1.274 1.166-2.205 2.393-1.97c5.198.994 8.516 1.006 13.71.003c1.227-.237 2.397.694 2.397 1.97v.414H34a2 2 0 0 1 2 2v1.528a2 2 0 0 1-2 2h-.75v.878a1.99 1.99 0 0 1-1.498 1.931c-2.854.727-5.224 1.101-7.65 1.1c-2.424 0-4.856-.376-7.834-1.103a1.99 1.99 0 0 1-1.518-1.936v-.87H14a2 2 0 0 1-2-2v-1.528a2 2 0 0 1 2-2h.75zm2 0v.417a2 2 0 0 1-2 2H14v1.528h.75a2 2 0 0 1 2 2v.865c2.886.704 5.147 1.044 7.353 1.044c2.203.001 4.397-.336 7.147-1.035v-.874a2 2 0 0 1 2-2H34v-1.528h-.75a2 2 0 0 1-2-2v-.414l-.002-.002l-.008-.004h-.008c-5.448 1.052-9.022 1.039-14.465-.003h-.008l-.007.004z\"/><path d=\"M19 22a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1m-4.25 11.229c0-1.274 1.166-2.205 2.393-1.97c5.198.994 8.516 1.006 13.71.003c1.227-.237 2.397.694 2.397 1.97v.414H34a2 2 0 0 1 2 2v1.528a2 2 0 0 1-2 2h-.75v.878a1.99 1.99 0 0 1-1.498 1.931c-2.854.727-5.224 1.101-7.65 1.1c-2.424 0-4.856-.376-7.834-1.103a1.99 1.99 0 0 1-1.518-1.936v-.87H14a2 2 0 0 1-2-2v-1.528a2 2 0 0 1 2-2h.75zm2 0v.417a2 2 0 0 1-2 2H14v1.528h.75a2 2 0 0 1 2 2v.865c2.886.704 5.147 1.044 7.353 1.044c2.203.001 4.397-.336 7.147-1.035v-.874a2 2 0 0 1 2-2H34v-1.528h-.75a2 2 0 0 1-2-2v-.414l-.002-.002l-.008-.004h-.008c-5.448 1.052-9.022 1.039-14.465-.003h-.008l-.007.004z\"/><path d=\"M19 35a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1\"/></g>"], "saddle": ["0 0 24 24", "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path stroke-linejoin=\"round\" d=\"m19.5 4.5l2.5 4c-.274.548-.887 1-1.5 1L19 8c-.896 0-1.717-.65-2-1.5M18.5 2l-1 1c-2 .5-3.312 1.936-3.834 3.502L13 8.5c-2.152 1.537-3.682 1.184-5.311.684c-1.034-.317-2.216-.157-2.98.607A2.42 2.42 0 0 0 4 11.503V21m.5-11.5l-.744-.372A1.213 1.213 0 0 0 2 10.213V14m15.5-6.5l-.097.146a3.1 3.1 0 0 0-.299 2.865a3.6 3.6 0 0 1 .187 2.034c-.186.931-1 1.928-1.791 2.455v6\"/><path d=\"M13 21v-6\"/><path stroke-linejoin=\"round\" d=\"M8 16s2.308 1.125 5 0\"/><path stroke-linejoin=\"round\" d=\"M8.5 15c-.5 1.5-2 2-2 2v4m0-11.5a3 3 0 1 0 6 0V9\"/></g>"], "nutri": ["0 0 48 48", "<g fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M5.027 12.004c.15 2.691.916 4.357 2.038 5.384a1.9 1.9 0 0 0-.749 1.832c.572 3.635 2.003 11.323 4.937 19.989a1.827 1.827 0 0 0 3.494 0c2.933-8.666 4.365-16.354 4.937-19.989a1.9 1.9 0 0 0-.749-1.832c1.122-1.027 1.888-2.693 2.038-5.384a.954.954 0 0 0-.974-.998c-1.629.024-2.922.123-3.93.462c-.417-1.099-1.258-2.136-2.523-3.082a.91.91 0 0 0-1.092 0c-1.255.939-2.093 1.966-2.513 3.055c-.98-.289-2.262-.404-3.937-.433a.954.954 0 0 0-.977.996m9.854 1.973l-.683-1.8c-.189-.499-.558-1.06-1.198-1.65c-.634.584-1.002 1.14-1.193 1.634l-.663 1.72l-1.768-.522c-.522-.154-1.234-.256-2.235-.311c.297 1.928 1.012 2.743 1.663 3.164c.932.603 2.29.786 4.166.788h.06c1.877-.002 3.234-.185 4.165-.788c.652-.421 1.368-1.237 1.665-3.17c-.97.051-1.651.152-2.154.321zM8.306 19h9.388c-.287 1.807-.784 4.6-1.57 8H12v2h3.645c-.69 2.782-1.56 5.882-2.645 9.13a115 115 0 0 1-.995-3.13H13v-2h-1.582a126 126 0 0 1-2.197-9H12v-2H8.827a107 107 0 0 1-.521-3\" clip-rule=\"evenodd\"/><path d=\"M38.242 28.03a1 1 0 0 1 .728 1.212a6.43 6.43 0 0 1-4.728 4.728a1 1 0 0 1-.485-1.94a4.43 4.43 0 0 0 3.273-3.273a1 1 0 0 1 1.212-.727\"/><path fill-rule=\"evenodd\" d=\"M32.65 21.027c-1.108-2.593-.916-5.347 1.057-7.32l-1.414-1.414c-2.33 2.33-2.734 5.377-1.953 8.178C25.764 18.4 21 22.208 21 28c0 5.523 4.925 10 11 10s11-4.477 11-10c0-6.22-5.495-10.151-10.35-6.973M32 24.061l-1.25-1c-1.858-1.486-3.688-1.403-5.074-.547C24.21 23.419 23 25.357 23 28c0 4.243 3.846 8 9 8s9-3.757 9-8c0-2.642-1.21-4.58-2.676-5.486c-1.386-.856-3.217-.939-5.075.548z\" clip-rule=\"evenodd\"/><path d=\"M34 18c3 0 5-2 5-5c-3 0-5 2-5 5\"/></g>"], "other": ["0 0 24 24", "<g fill=\"currentColor\"><path d=\"M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12Z\"/><path d=\"M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z\"/><path d=\"M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z\" opacity=\".5\"/></g>"], "cal": ["0 0 24 24", "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"><path d=\"M16 2v4M8 2v4m13 10v-4c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22h1M3 10h18\"/><path d=\"M21 19.5h-6.5m2 2.5c-.506-.491-2.5-1.8-2.5-2.5s1.994-2.009 2.5-2.5\"/></g>"]};
  const ico=(k,px,col)=>{ const [vb,b]=IC[k]||IC.other; return `<svg viewBox="${vb}" style="width:${px}px;height:${px}px;color:${col||'#5B9BFF'};flex:0 0 auto" aria-hidden="true">${b}</svg>`; };
  const PROS=[['vet','Vet'],['osteo','Osteopath'],['farrier','Farrier'],['dentist','Dentist'],['physio','Physio'],['chiro','Chiropractor'],['saddle','Saddle fitter'],['nutri','Nutritionist'],['other','Other']];
  const PN=Object.fromEntries(PROS);
  const TODAY=new Date(2026,8,30), MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MONL=['January','February','March','April','May','June','July','August','September','October','November','December'], DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const day=s=>{ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const fmt=d=>`${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  /* sample visits, so the calendar and the charts are not empty in the prototype */
  const SAMPLE={
    mb:[['farrier','2026-01-20','',''],['vet','2026-02-26','Dr. Anne Keller','Vaccination'],['osteo','2026-03-18','',''],['farrier','2026-04-15','',''],['dentist','2026-06-10','',''],['osteo','2026-07-22','',''],['vet','2026-08-27','Dr. Anne Keller','Check-up, left hind'],['farrier','2026-09-16','',''],['osteo','2026-10-06','','']],
    qz:[['farrier','2026-03-04','',''],['vet','2026-05-12','',''],['osteo','2026-07-08','',''],['farrier','2026-09-02','',''],['saddle','2026-09-21','','']],
    bd:[['vet','2026-03-24','',''],['farrier','2026-06-03','',''],['physio','2026-08-12','',''],['farrier','2026-09-23','','']],
    sa:[['farrier','2026-02-18','',''],['osteo','2026-05-27','',''],['vet','2026-08-19','',''],['farrier','2026-09-09','',''],['vet','2026-10-02','','']],
    nl:[['dentist','2026-04-07','',''],['farrier','2026-07-01','',''],['osteo','2026-09-15','','']],
    /* client horses of the vet and of the farrier (outside the stable) */
    c_orf:[['vet','2026-04-14','Dr. Anne Keller','Vaccination'],['farrier','2026-08-05','',''],['vet','2026-09-22','Dr. Anne Keller','Check-up'],['vet','2026-10-09','Dr. Anne Keller','Follow-up']],
    c_uly:[['farrier','2026-06-24','Lucas Bernard',''],['vet','2026-07-15','',''],['farrier','2026-08-12','Lucas Bernard','']]};
  let store={}; try{ store=JSON.parse(localStorage.getItem('sdVisits'))||{}; }catch(e){}
  function list(hid){ if(!store[hid]) store[hid]=(SAMPLE[hid]||[]).map(([type,date,who,note],i)=>({id:hid+i,type,date,who,note}));
    return store[hid].map(v=>({...v,d:day(v.date)})).sort((a,b)=>a.d-b.d); }

  /* ---------- on the Trends chart ---------- */
  /* P: the points of the chart [{s:{date}, v}], X(k): x of point k */
  function xOf(P,X,d){ const n=P.length; if(!n||d<P[0].s.date||d>P[n-1].s.date) return null;
    for(let k=0;k<n-1;k++){ const a=P[k].s.date, b=P[k+1].s.date; if(d>=a&&d<=b) return X(k)+(X(k+1)-X(k))*((d-a)/((b-a)||1)); } return X(n-1); }
  function impact(P,d){ const bef=P.filter(p=>p.s.date<d).slice(-3), aft=P.filter(p=>p.s.date>d).slice(0,3);
    if(!bef.length||!aft.length) return null; const av=a=>a.reduce((s,p)=>s+p.v,0)/a.length; return {b:av(bef),a:av(aft),nb:bef.length,na:aft.length}; }
  function markers(hid,P,X,Y0,Y1,sel){ return list(hid).map(v=>{ const x=xOf(P,X,v.d); if(x==null) return '';
      const on=sel===v.id;
      return `<g class="cvM" data-v="${v.id}" style="cursor:pointer"><line x1="${x}" x2="${x}" y1="${Y0-2}" y2="${Y1}" stroke="${on?'#8DB8FF':'rgba(141,184,255,.45)'}" stroke-width="${on?1.6:1.1}" stroke-dasharray="2.5 3"/>
        <circle cx="${x}" cy="${Y0-8}" r="${on?9.5:8}" fill="${on?'#3B82F6':'#16233A'}" stroke="#5B9BFF" stroke-width="1.2"/>
        <g transform="translate(${x-5.5} ${Y0-13.5})"><svg width="11" height="11" viewBox="${(IC[v.type]||IC.other)[0]}" style="color:${on?'#fff':'#8DB8FF'}">${(IC[v.type]||IC.other)[1]}</svg></g>
        <rect x="${x-11}" y="${Y0-19}" width="22" height="${Y1-Y0+19}" fill="transparent"/></g>`; }).join(''); }
  /* the rows under the chart: what happened before and after each visit, for this metric */
  function rows(hid,P,m,f,sel){ const L=list(hid).filter(v=>P.length&&v.d>=P[0].s.date&&v.d<=P[P.length-1].s.date).reverse();
    if(!L.length) return '';
    return `<div class="cvH"><div class="k">CARE VISITS ON THIS CHART</div><span>Average of the videos before and after</span></div>`+L.map(v=>{ const im=impact(P,v.d);
      let tail='<span class="cvD flat">Not enough videos yet</span>';
      if(im){ const d=im.a-im.b, same=Math.abs(d)<(m.sd||1)*.3, good=m.better===0?null:(d>0)===(m.better>0), tone=same||good===null?'flat':good?'up':'down';
        tail=`<span class="cvD ${tone}">${f(im.b)} → ${f(im.a)}${m.u==='%'?'%':' '+m.u}</span>`; }
      return `<div class="cvR${sel===v.id?' sel':''}" data-v="${v.id}"><span class="cvI">${ico(v.type,18)}</span><div class="t"><div class="a">${PN[v.type]||'Other'}${v.who?' · '+v.who:''}</div><div class="b">${fmt(v.d)}${v.note?' · '+v.note:''}</div></div>${tail}</div>`; }).join(''); }

  /* ---------- the card on the horse page ---------- */
  /* usual rhythm of each kind of care, in days: what tells you something is due */
  const RHY={farrier:42,osteo:90,vet:182,dentist:365};
  const ago=d=>{ const n=Math.round((TODAY-d)/864e5); return n===0?'Today':n===1?'Yesterday':n<0?(n===-1?'Tomorrow':`In ${-n} days`):n<60?`${n} days ago`:`${Math.round(n/30)} months ago`; };
  const addD=(d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
  let calM=null, pickDay=null, view='cal', lastH=null;
  /* performance before / after a visit, from the horse's videos */
  function eff(sess,d){ if(!sess||!sess.length) return null; const b=sess.filter(x=>x.date<d).sort((a,b)=>b.date-a.date).slice(0,3), a=sess.filter(x=>x.date>d).sort((a,b)=>a.date-b.date).slice(0,3);
    if(!b.length||!a.length) return null; const av=L=>Math.round(L.reduce((s,x)=>s+x.sc,0)/L.length); return {b:av(b),a:av(a)}; }
  const effChip=e=>{ if(!e) return ''; const d=e.a-e.b, t=Math.abs(d)<2?'flat':d>0?'up':'down';
    return `<span class="cvEf ${t}" title="Average performance, 3 videos before and after">${e.b} → ${e.a}%</span>`; };
  function card(el,h,onChange,sess){
    if(lastH!==h.id){ lastH=h.id; pickDay=null; calM=null; view='cal'; delete el.dataset.all; }
    el._args=[h,onChange,sess];
    const L=list(h.id), up=L.filter(v=>v.d>TODAY), past=L.filter(v=>v.d<=TODAY).reverse();
    const re=()=>card(el,h,onChange,sess);
    /* rhythm: the four regular cares, how long since, when next */
    const rh=Object.entries(RHY).map(([k,days])=>{ const last=past.find(v=>v.type===k), plan=up.find(v=>v.type===k);
      if(!last) return `<div class="cvRy none"><div class="h">${ico(k,18)}<b>${PN[k]}</b></div><div class="v">Not logged yet</div><div class="c">No visit on record</div></div>`;
      /* no guess about the next visit: only what happened, and a visit only if it is really planned */
      const st=plan?`Planned ${fmt(plan.d)}`:`Last ${fmt(last.d)}`;
      return `<button class="cvRy${plan?' planned':''}" data-v="${last.id}"><div class="h">${ico(k,18)}<b>${PN[k]}</b></div><div class="v">${ago(last.d)}</div>
        <div class="c">${st}</div></button>`; }).join('');
    /* timeline, newest first, planned visits on top */
    const item=(v,planned)=>{ const e=planned?null:eff(sess,v.d);
      return `<button class="cvIt${planned?' plan':''}" data-v="${v.id}"><span class="nd">${ico(v.type,17,planned?'#8DB8FF':'#fff')}</span>
        <div class="t"><div class="a">${PN[v.type]||'Other'}${v.who?` <span>· ${v.who}</span>`:''}</div><div class="b">${fmt(v.d)} · ${ago(v.d)}${v.note?' · '+v.note:''}</div></div>${planned?'<span class="cvPl">Planned</span>':effChip(e)}</button>`; };
    let tl=''; if(up.length) tl+=`<div class="cvMo">UPCOMING</div>`+up.map(v=>item(v,true)).join('');
    const show=el.dataset.all?past:past.slice(0,4); let lm='';
    show.forEach(v=>{ const m=MONL[v.d.getMonth()].toUpperCase()+' '+v.d.getFullYear(); if(m!==lm){ lm=m; tl+=`<div class="cvMo">${m}</div>`; } tl+=item(v,false); });
    if(!L.length) tl=`<div class="cvEmpty">No visit on record yet.</div>`;
    if(!el.dataset.all&&past.length>4) tl+=`<button class="cvMore" id="cvMore">See all ${past.length} visits</button>`;
    /* calendar */
    if(!calM) calM=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
    const y=calM.getFullYear(), mo=calM.getMonth(), first=(new Date(y,mo,1).getDay()+6)%7, n=new Date(y,mo+1,0).getDate();
    const on=d=>L.filter(v=>v.d.getFullYear()===y&&v.d.getMonth()===mo&&v.d.getDate()===d);
    let cells=''; for(let i=0;i<first;i++) cells+='<span></span>';
    for(let d=1;d<=n;d++){ const vs=on(d), td=y===TODAY.getFullYear()&&mo===TODAY.getMonth()&&d===TODAY.getDate(), fut=new Date(y,mo,d)>TODAY;
      cells+=`<button class="${vs.length?'has':''}${td?' td':''}${pickDay===iso(new Date(y,mo,d))?' on':''}${fut?' fut':''}" data-d="${d}">${d}${vs.length?`<i>${vs.slice(0,2).map(v=>ico(v.type,10,'currentColor')).join('')}</i>`:''}</button>`; }
    const dayL=pickDay?L.filter(v=>v.date===pickDay):[];
    const cal=`<div class="cvCal"><div class="cvCalH"><button data-c="-1" aria-label="Previous month"><svg viewBox="0 0 24 24"><path d="M14.5 6 8.5 12l6 6"/></svg></button><b>${MONL[mo]} ${y}</b><button data-c="1" aria-label="Next month"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg></button></div>
        <div class="cvW">${Array.from({length:7},(_,i)=>new Date(2026,0,5+i).toLocaleDateString(window.SD_LANG||'en',{weekday:'narrow'})).map(x=>`<span>${x}</span>`).join('')}</div><div class="cvG">${cells}</div></div>
      ${pickDay?`<div class="cvDay">${fmt(day(pickDay))}</div>${dayL.length?dayL.map(v=>item(v,v.d>TODAY)).join(''):`<div class="cvEmpty">No visit this day.</div>`}`:'<div class="cvHint">Tap a day to see its visits</div>'}`;
    const lastAny=past[0];
    el.innerHTML=`<div class="lhead"><div><h2>Care &amp; visits</h2><div class="cvSub">${lastAny?`Last visit ${ago(lastAny.d).toLowerCase()} · ${L.length} logged`:'Vet, osteopath, farrier and more'}</div></div>
</div>
      <div class="cvRail">${rh}</div>
      <div class="cvSeg"><button class="${view==='cal'?'on':''}" data-w="cal">Calendar</button><button class="${view==='time'?'on':''}" data-w="time">Timeline</button></div>
      <div class="cvBody">${view==='time'?`<div class="cvTl">${tl}</div>`:cal}</div>
      <div class="cvFoot">${ico('other',14,'#5A6472')}Visits show on the Trends, with the performance before and after.</div>`;
    el.querySelectorAll('.cvSeg button').forEach(b=>b.onclick=()=>{ view=b.dataset.w; re(); });
    el.querySelectorAll('.cvCalH button').forEach(b=>b.onclick=()=>{ calM=new Date(y,mo+ +b.dataset.c,1); pickDay=null; re(); });
    el.querySelectorAll('.cvG button').forEach(b=>b.onclick=()=>{ const k=iso(new Date(y,mo,+b.dataset.d)); pickDay=pickDay===k?null:k; re(); });
    const more=el.querySelector('#cvMore'); if(more) more.onclick=()=>{ el.dataset.all='1'; re(); };
    const done=()=>{ re(); onChange&&onChange(); };
    el.querySelectorAll('.cvRy[data-v]').forEach(b=>b.onclick=()=>openDetail(h,b.dataset.v,sess,done));
    el.querySelectorAll('.cvIt').forEach(b=>b.onclick=()=>openDetail(h,b.dataset.v,sess,done));
  }

  /* ---------- one visit: what it was, and what changed after ---------- */
  function openDetail(h,id,sess,done){
    const v=list(h.id).find(x=>x.id===id); if(!v) return; ensure();
    const e=v.d<=TODAY?eff(sess,v.d):null, d=e?e.a-e.b:0;
    const verdict=!e?(v.d>TODAY?'Planned visit. We will show the performance after it once there are videos.':'Not enough videos around this visit yet to compare.')
      :Math.abs(d)<2?'About the same performance after this visit.':d>0?`Performance up ${d} points in the 3 videos after.`:`Performance down ${-d} points in the 3 videos after.`;
    document.getElementById('cvBody').innerHTML=`<div class="cvDH"><span class="cvDI">${ico(v.type,30)}</span><div><div class="cvDT">${PN[v.type]||'Other'}</div><div class="cvDS">${fmt(v.d)} · ${ago(v.d)}</div></div></div>
      ${v.who||v.note?`<div class="cvDR">${v.who?`<div><span>WHO</span><b>${v.who}</b></div>`:''}${v.note?`<div><span>NOTE</span><b>${v.note}</b></div>`:''}</div>`:''}
      <div class="cvDE ${!e?'':Math.abs(d)<2?'flat':d>0?'up':'down'}">${e?`<div class="nums"><div><span>BEFORE</span><b>${e.b}%</b></div><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg><div><span>AFTER</span><b>${e.a}%</b></div></div>`:''}<p>${verdict}</p></div>
`;
    openSheet();
  }

  /* ---------- the sheet that shows one visit (read-only) ---------- */
  let sheet=null, F=null;
  function ensure(){ if(sheet) return; document.body.insertAdjacentHTML('beforeend',`<div class="cvVeil" id="cvVeil"></div><div class="cvSheet" id="cvSheet" role="dialog" aria-label="Visit"><div class="grab"></div>
      <div class="cvTop"><h3>Visit</h3><button class="cvClose" id="cvClose" aria-label="Close">×</button></div><div id="cvBody"></div></div>`); sheet=document.getElementById('cvSheet');
    const close=()=>{ sheet.classList.remove('on'); document.getElementById('cvVeil').classList.remove('on'); };
    document.getElementById('cvVeil').onclick=close; document.getElementById('cvClose').onclick=close; sheet._close=close; }
  function openSheet(){ sheet.scrollTop=0; document.getElementById('cvVeil').classList.add('on'); sheet.classList.add('on'); }

  const css=`
  .cvAdd{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:12.5px;font-weight:800;color:#fff;background:var(--blue);border:0;border-radius:999px;padding:7px 12px 7px 10px;cursor:pointer}
  .cvNext{display:flex;align-items:center;gap:11px;margin-top:12px;padding:11px 12px;border-radius:14px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25)}
  .cvNext b{display:block;font-size:13px} .cvNext span{font-size:11.5px;color:var(--mut)}
  .cvCal{margin-top:12px;padding:10px 10px 8px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid var(--line)}
  .cvCalH{display:flex;align-items:center;justify-content:space-between} .cvCalH b{font-size:13.5px}
  .cvCalH button{width:30px;height:30px;border-radius:50%;border:1px solid var(--line);background:none;display:grid;place-items:center;cursor:pointer}
  .cvCalH svg{width:15px;height:15px;stroke:var(--txt,#F2F5F8);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  .cvW,.cvG{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}
  .cvW{margin-top:8px} .cvW span{font-size:10px;font-weight:800;color:var(--dim)}
  .cvG{margin-top:4px} .cvG button{position:relative;height:38px;border:0;border-radius:10px;background:none;color:#C7CFDB;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:5px}
  .cvG button.fut{color:#8A94A3}
  .cvG button.td{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.25)}
  .cvG button.has{background:rgba(59,130,246,.14);color:#fff}
  .cvG button.on{background:var(--blue);color:#fff}
  .cvG button i{display:flex;gap:1px;margin-top:2px;color:#8DB8FF} .cvG button.on i{color:#fff}
  .cvG.pick button{height:34px;justify-content:center;padding:0}
  .cvSel{text-align:center;font-size:12px;color:var(--mut);font-weight:700;margin-top:6px}
  .cvList{margin-top:6px}
  .cvR{display:flex;align-items:center;gap:11px;padding:10px 2px;border-top:1px solid var(--line)}
  .cvList .cvR:first-child,.cvDay+.cvR{border-top:0}
  .cvI{width:36px;height:36px;border-radius:11px;background:rgba(59,130,246,.12);display:grid;place-items:center;flex:0 0 auto}
  .cvR .t{flex:1;min-width:0} .cvR .a{font-size:13.5px;font-weight:700} .cvR .b{font-size:11.5px;color:var(--mut);margin-top:1px}
  .cvX{width:28px;height:28px;border-radius:50%;border:0;background:rgba(255,255,255,.05);color:var(--mut);font-size:16px;cursor:pointer;flex:0 0 auto}
  .cvDay{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;letter-spacing:.6px;color:var(--mut);text-transform:uppercase;margin:8px 2px 2px}
  .cvDay button,.cvMore{background:none;border:0;color:#8DB8FF;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-transform:none;letter-spacing:0}
  .cvMore{display:block;margin:8px auto 0}
  .cvEmpty{font-size:12.5px;color:var(--mut);padding:12px 2px}
  .cvH{display:flex;justify-content:space-between;align-items:baseline;margin:14px 2px 2px} .cvH span{font-size:10.5px;color:var(--dim);font-weight:600}
  .cvH .k{font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--mut)}
  .cvR.sel{background:rgba(59,130,246,.08);border-radius:12px;padding-left:8px;padding-right:8px}
  .cvD{font-size:12px;font-weight:800;border-radius:999px;padding:4px 9px;white-space:nowrap;flex:0 0 auto}
  .cvD.up{color:#5BE3A0;background:rgba(61,214,140,.13)} .cvD.down{color:#FF7B80;background:rgba(242,85,90,.13)} .cvD.flat{color:#8DB8FF;background:rgba(59,130,246,.12)}
  .cvVeil{position:fixed;inset:0;background:rgba(4,6,9,.62);z-index:180;opacity:0;pointer-events:none;transition:opacity .25s} .cvVeil.on{opacity:1;pointer-events:auto}
  .cvSheet{position:fixed;left:0;right:0;bottom:0;max-width:420px;margin:0 auto;z-index:181;background:#161B23;border-top-left-radius:22px;border-top-right-radius:22px;border:1px solid var(--line);
    padding:10px 16px 26px;max-height:92vh;overflow-y:auto;transform:translateY(105%);transition:transform .34s cubic-bezier(.32,.72,0,1)}
  .cvSheet.on{transform:none}
  .cvSheet .grab{width:38px;height:5px;border-radius:3px;background:rgba(255,255,255,.18);margin:0 auto 10px}
  .cvTop{display:flex;align-items:center;justify-content:space-between} .cvTop h3{font-size:17px;font-weight:700}
  .cvClose{width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:#fff;font-size:18px;cursor:pointer}
  .cvSheet .sub{font-size:12.5px;color:var(--mut);margin-top:3px}
  .cvSheet .k{font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--mut);margin:16px 2px 8px} .cvSheet .k em{font-style:normal;color:#8DB8FF;letter-spacing:0;text-transform:none;margin-left:4px}
  .cvPros{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .cvPros button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px 10px;border-radius:14px;background:var(--card,#14181F);border:1.5px solid var(--line);color:#C7CFDB;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
  .cvPros button.on{background:var(--blue);border-color:var(--blue);color:#fff}
  .cvIn{width:100%;font:inherit;font-size:14px;color:var(--txt,#F2F5F8);background:var(--card,#14181F);border:1px solid var(--line);border-radius:12px;padding:12px;outline:none} .cvIn:focus{border-color:var(--blue)}
  .cvSave{width:100%;margin-top:18px;font:inherit;font-size:15.5px;font-weight:800;color:#fff;background:var(--blue);border:0;border-radius:16px;padding:15px;cursor:pointer} .cvSave:disabled{opacity:.45}
  .cvSub{font-size:12px;color:var(--mut);margin-top:3px;font-weight:600}
  .cvAddR{width:36px;height:36px;border-radius:50%;border:0;background:var(--blue);display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 16px rgba(59,130,246,.35);flex:0 0 auto}
  .cvAddR svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2.4;stroke-linecap:round}
  .cvRail{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:14px -16px 0;padding:0 16px 2px}
  .cvRy{flex:0 0 132px;text-align:left;font:inherit;color:inherit;padding:11px 12px 10px;border-radius:16px;background:linear-gradient(180deg,#1B212B,#161B23);border:1px solid var(--line);cursor:pointer}
  .cvRy .h{display:flex;align-items:center;gap:7px} .cvRy .h b{font-size:12.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cvRy .v{font-size:16px;font-weight:800;margin-top:9px;letter-spacing:-.2px}
  .cvRy .bar{height:4px;border-radius:2px;background:rgba(255,255,255,.08);margin-top:8px;overflow:hidden} .cvRy .bar i{display:block;height:100%;border-radius:2px;background:#5B9BFF}
  .cvRy .c{font-size:10.5px;color:var(--mut);margin-top:6px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cvRy.soon .bar i{background:var(--orange)} .cvRy.soon .c{color:#FFD27A}
  .cvRy.late .bar i{background:var(--red)} .cvRy.late .c{color:#FF7B80}
  .cvRy.planned .c{color:#8DB8FF}
  .cvRy.none{border-style:dashed} .cvRy.none .v{font-size:12.5px;color:var(--mut);font-weight:700} .cvRy.none .c{color:#8DB8FF}
  .cvSeg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-top:14px}
  .cvSeg button{font:inherit;font-size:12.5px;font-weight:700;color:var(--mut);background:none;border:0;border-radius:9px;padding:8px;cursor:pointer}
  .cvSeg button.on{background:var(--blue);color:#fff}
  .cvBody{margin-top:6px}
  .cvTl{position:relative}
  .cvMo{font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--mut);margin:14px 2px 4px}
  .cvIt{position:relative;width:100%;display:flex;align-items:center;gap:12px;padding:9px 0 9px 0;background:none;border:0;font:inherit;color:inherit;text-align:left;cursor:pointer}
  .cvIt::before{content:"";position:absolute;left:17px;top:-6px;bottom:-6px;width:2px;background:rgba(91,155,255,.18)}
  .cvIt .nd{position:relative;z-index:1;width:36px;height:36px;border-radius:50%;background:#1E3354;border:2px solid #0F1622;display:grid;place-items:center;flex:0 0 auto;box-shadow:0 0 0 1px rgba(91,155,255,.35)}
  .cvIt.plan .nd{background:#0F1622;box-shadow:0 0 0 1.5px rgba(91,155,255,.6);border-style:dashed}
  .cvIt .t{flex:1;min-width:0} .cvIt .a{font-size:13.5px;font-weight:800} .cvIt .a span{font-weight:600;color:var(--mut)} .cvIt .b{font-size:11.5px;color:var(--mut);margin-top:2px}
  .cvPl{font-size:10.5px;font-weight:800;color:#8DB8FF;background:rgba(59,130,246,.14);border-radius:999px;padding:4px 9px;flex:0 0 auto}
  .cvEf{font-size:11px;font-weight:800;border-radius:999px;padding:4px 8px;flex:0 0 auto;white-space:nowrap}
  .cvEf.up{color:#5BE3A0;background:rgba(61,214,140,.13)} .cvEf.down{color:#FF7B80;background:rgba(242,85,90,.13)} .cvEf.flat{color:#8DB8FF;background:rgba(59,130,246,.12)}
  .cvHint{text-align:center;font-size:11.5px;color:var(--dim);margin-top:8px}
  .cvLink{background:none;border:0;color:#8DB8FF;font:inherit;font-weight:700;cursor:pointer}
  .cvFoot{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dim);margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
  .cvQ{display:flex;flex-wrap:wrap;gap:7px} .cvQ button{font:inherit;font-size:13px;font-weight:700;color:#C7CFDB;background:var(--card,#14181F);border:1px solid var(--line);border-radius:999px;padding:8px 13px;cursor:pointer}
  .cvQ button.on{background:var(--blue);border-color:var(--blue);color:#fff}
  .cvRp{font-size:12px;color:#8DB8FF;margin-top:8px;font-weight:600}
  .cvSheet .cvCal{margin-top:10px}
  .cvDH{display:flex;align-items:center;gap:14px;margin-top:6px} .cvDI{width:58px;height:58px;border-radius:18px;background:rgba(59,130,246,.14);display:grid;place-items:center}
  .cvDT{font-size:21px;font-weight:800;letter-spacing:-.3px} .cvDS{font-size:12.5px;color:var(--mut);margin-top:2px}
  .cvDR{display:grid;gap:8px;margin-top:14px} .cvDR div{padding:10px 12px;border-radius:12px;background:var(--card,#14181F);border:1px solid var(--line)}
  .cvDR span,.cvDE span{display:block;font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--mut)} .cvDR b{font-size:14px}
  .cvDE{margin-top:12px;padding:14px;border-radius:16px;background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.22)}
  .cvDE.up{background:rgba(61,214,140,.07);border-color:rgba(61,214,140,.25)} .cvDE.down{background:rgba(242,85,90,.07);border-color:rgba(242,85,90,.25)}
  .cvDE .nums{display:flex;align-items:center;gap:16px} .cvDE .nums b{font-size:26px;font-weight:800} .cvDE .nums svg{width:20px;height:20px;stroke:var(--mut);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .cvDE p{font-size:13.5px;margin-top:8px;color:#DCE2EA;line-height:1.4}
  .cvDA{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin-top:16px}
  .cvDA button{font:inherit;font-size:14.5px;font-weight:800;border-radius:14px;padding:13px;cursor:pointer;border:1px solid var(--line)}
  .cvDel{background:rgba(242,85,90,.1);color:#FF7B80;border-color:rgba(242,85,90,.25)!important} .cvEd{background:var(--blue);color:#fff;border-color:var(--blue)!important}
  html[data-theme="light"] .cvRy{background:var(--card)} html[data-theme="light"] .cvIt .nd{background:#DCE8FB;border-color:#fff} html[data-theme="light"] .cvDE p{color:var(--txt)} html[data-theme="light"] .cvQ button{color:var(--txt)} html[data-theme="light"] .cvQ button.on{color:#fff}
  html[data-theme="light"] .cvSheet{background:var(--card)} html[data-theme="light"] .cvG button{color:var(--txt)} html[data-theme="light"] .cvG button.on{color:#fff}
  html[data-theme="light"] .cvCalH svg{stroke:var(--txt)} html[data-theme="light"] .cvPros button{color:var(--txt)} html[data-theme="light"] .cvPros button.on{color:#fff}`;
  document.head.insertAdjacentHTML('beforeend',`<style id="careCss">${css}</style>`);
  window.CARE={list,markers,rows,card,openDetail,ico};
})();
