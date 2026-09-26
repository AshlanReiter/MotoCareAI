/* MotoCare AI — vanilla JS prototype. No backend. */
(() => {
  const app = document.getElementById("app");
  const state = {
    page: "dashboard",
    search: "",
    authenticated: localStorage.getItem("motocare_staff_session") === "1",
    authView: "login",
    showProfileMenu: false,
    notificationsOpen: false,
    account: JSON.parse(localStorage.getItem("motocare_staff_account") || '{"name":"Francis","email":"admin@motocare.ai","role":"Administrator"}'),
    notifications: [
      {id:1,title:"Low stock alert",text:"Oil Filter — Honda is below reorder level.",time:"10 min ago",read:false},
      {id:2,title:"Pending appointment",text:"Miguel Santos has a pending 10:30 AM appointment.",time:"25 min ago",read:false},
      {id:3,title:"Repair completed",text:"REP-2003 was marked as completed.",time:"1 hr ago",read:true}
    ],
    customerFilter: "All",
    statusFilter: "All",
    inventoryFilter: "All",
    selectedCustomer: null,
    selectedMotorcycle: null,
    selectedAppointment: null,
    selectedRepair: null,
    selectedMechanic: null,
    selectedItem: null,
    report: null,
    modal: null,
    toastTimer: null,
    cart: [
      {id:"svc1", name:"Periodic Maintenance Service", price:850, qty:1, type:"Service"}
    ]
  };

  const data = {
    customers: [
      {id:"CUS-001",name:"Juan Dela Cruz",phone:"0917 555 1023",email:"juan@email.com",address:"Binangonan, Rizal",motorcycles:2,status:"Active"},
      {id:"CUS-002",name:"Miguel Santos",phone:"0920 311 8842",email:"miguel@email.com",address:"Angono, Rizal",motorcycles:1,status:"Active"},
      {id:"CUS-003",name:"Carlo Reyes",phone:"0918 220 4471",email:"carlo@email.com",address:"Taytay, Rizal",motorcycles:1,status:"Active"},
      {id:"CUS-004",name:"Mark Villanueva",phone:"0995 742 1180",email:"mark@email.com",address:"Cainta, Rizal",motorcycles:3,status:"Active"},
      {id:"CUS-005",name:"Paolo Garcia",phone:"0917 809 5530",email:"paolo@email.com",address:"Cardona, Rizal",motorcycles:1,status:"Inactive"}
    ],
    motorcycles: [
      {id:"MOT-001",owner:"Juan Dela Cruz",brand:"Honda",model:"Click 125i",year:"2023",plate:"123-ABC",mileage:"18,420 km",chassis:"HC123456789",engine:"ENG987654",lastService:"Aug 20, 2026",nextService:"Nov 20, 2026"},
      {id:"MOT-002",owner:"Juan Dela Cruz",brand:"Yamaha",model:"NMAX 155",year:"2022",plate:"456-DEF",mileage:"27,110 km",chassis:"YM223456789",engine:"ENG876543",lastService:"Jul 11, 2026",nextService:"Oct 11, 2026"},
      {id:"MOT-003",owner:"Miguel Santos",brand:"Honda",model:"TMX 125",year:"2021",plate:"789-GHI",mileage:"35,800 km",chassis:"HC323456789",engine:"ENG765432",lastService:"Jun 03, 2026",nextService:"Sep 03, 2026"},
      {id:"MOT-004",owner:"Carlo Reyes",brand:"Suzuki",model:"Raider 150",year:"2024",plate:"321-JKL",mileage:"9,240 km",chassis:"SZ423456789",engine:"ENG654321",lastService:"Sep 05, 2026",nextService:"Dec 05, 2026"}
    ],
    appointments: [
      {id:"APT-1001",time:"09:00 AM",date:"2026-09-26",customer:"Juan Dela Cruz",motorcycle:"Honda Click 125i",service:"PMS",mechanic:"Ramon Cruz",status:"Confirmed",notes:"Customer requested oil change."},
      {id:"APT-1002",time:"10:30 AM",date:"2026-09-26",customer:"Miguel Santos",motorcycle:"Honda TMX 125",service:"Brake Inspection",mechanic:"Leo Mendoza",status:"Pending",notes:"Rear brake feels weak."},
      {id:"APT-1003",time:"01:00 PM",date:"2026-09-26",customer:"Carlo Reyes",motorcycle:"Suzuki Raider 150",service:"Chain Adjustment",mechanic:"Ramon Cruz",status:"Confirmed",notes:"Check chain tension."},
      {id:"APT-1004",time:"03:30 PM",date:"2026-09-27",customer:"Mark Villanueva",motorcycle:"Yamaha Mio",service:"General Checkup",mechanic:"Unassigned",status:"Pending",notes:"Walk-in request."}
    ],
    repairs: [
      {id:"REP-2001",customer:"Juan Dela Cruz",motorcycle:"Honda Click 125i",service:"Periodic Maintenance",mechanic:"Ramon Cruz",status:"Ongoing",estimate:1850,concern:"Routine maintenance",notes:"Replace oil and inspect CVT.",parts:["Engine Oil","Oil Filter"]},
      {id:"REP-2002",customer:"Miguel Santos",motorcycle:"Honda TMX 125",service:"Brake Inspection",mechanic:"Leo Mendoza",status:"Inspection",estimate:900,concern:"Weak rear brake",notes:"Inspect brake shoe and cable.",parts:[]},
      {id:"REP-2003",customer:"Carlo Reyes",motorcycle:"Suzuki Raider 150",service:"Chain Adjustment",mechanic:"Ramon Cruz",status:"Completed",estimate:450,concern:"Loose chain",notes:"Adjusted and lubricated chain.",parts:["Chain Lube"]}
    ],
    mechanics: [
      {id:"MECH-01",name:"Ramon Cruz",contact:"0917 441 2300",specialization:"Engine & PMS",activeJobs:2,status:"Available",completed:148},
      {id:"MECH-02",name:"Leo Mendoza",contact:"0921 778 1201",specialization:"Brakes & Chassis",activeJobs:1,status:"Busy",completed:121},
      {id:"MECH-03",name:"Kevin Flores",contact:"0998 501 4402",specialization:"Electrical",activeJobs:0,status:"Available",completed:96}
    ],
    inventory: [
      {id:"INV-01",sku:"OIL-10W40",name:"Engine Oil 10W-40",category:"Lubricants",supplier:"Motul",stock:18,reorder:10,price:420},
      {id:"INV-02",sku:"FIL-HC125",name:"Oil Filter — Honda",category:"Filters",supplier:"Honda",stock:7,reorder:10,price:280},
      {id:"INV-03",sku:"BRK-SHOE",name:"Brake Shoe Set",category:"Brakes",supplier:"Brembo",stock:24,reorder:8,price:560},
      {id:"INV-04",sku:"CLN-CHAIN",name:"Chain Cleaner",category:"Maintenance",supplier:"Motul",stock:4,reorder:8,price:390},
      {id:"INV-05",sku:"LUBE-CHAIN",name:"Chain Lube",category:"Lubricants",supplier:"Motul",stock:12,reorder:6,price:350}
    ],
    products: [
      {id:"svc1",name:"Periodic Maintenance Service",category:"Service",price:850},
      {id:"svc2",name:"Brake Inspection",category:"Service",price:500},
      {id:"svc3",name:"General Checkup",category:"Service",price:400},
      {id:"svc4",name:"Chain Adjustment",category:"Service",price:450},
      {id:"INV-01",name:"Engine Oil 10W-40",category:"Part",price:420},
      {id:"INV-02",name:"Oil Filter — Honda",category:"Part",price:280},
      {id:"INV-03",name:"Brake Shoe Set",category:"Part",price:560},
      {id:"INV-05",name:"Chain Lube",category:"Part",price:350}
    ]
  };

  const nav = [
    ["dashboard","▦","Dashboard"],
    ["customers","♙","Customers"],
    ["motorcycles","◈","Motorcycles"],
    ["appointments","◷","Appointments"],
    ["repairs","⚙","Repairs & Services"],
    ["mechanics","♟","Mechanics"],
    ["inventory","▤","Inventory"],
    ["pos","₱","Sales & POS"],
    ["reports","▥","Reports"]
  ];

  const money = n => "₱" + Number(n || 0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const initials = name => String(name||"").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase();
  const badge = status => {
    const s = String(status||"").toLowerCase();
    let c = s.includes("complete")||s==="active"||s==="available"||s==="confirmed"||s==="paid" ? "success" :
            s.includes("pending")||s==="inspection"||s==="busy" ? "warning" :
            s.includes("cancel")||s==="inactive" ? "danger" : s.includes("ongoing")||s==="received" ? "info" : "gray";
    return `<span class="badge ${c}">${esc(status)}</span>`;
  };

  function shell(content){
    if(!state.authenticated){
      app.innerHTML=authMarkup(); bindAuth(); return;
    }
    const unread=state.notifications.filter(n=>!n.read).length;
    app.innerHTML=`
      <div class="app">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><div class="brand-mark">M</div><div><strong>MotoCare AI</strong><small>Shop Management System</small></div></div>
          <nav class="nav"><div class="nav-label">Main Menu</div>${nav.map(([id,icon,label])=>`<button type="button" class="${state.page===id?'active':''}" data-nav="${id}"><span class="nav-icon">${icon}</span>${label}</button>`).join("")}</nav>
          <div class="sidebar-foot">Prototype Interface<br>Owner / Staff Portal</div>
        </aside>
        <main class="main">
          <header class="topbar">
            <div class="top-actions"><button class="icon-btn mobile-menu" type="button" data-action="menu">☰</button><div class="breadcrumb">MotoCare AI / <strong>${pageTitle()}</strong></div></div>
            <div class="top-actions">
              <div class="notification-wrap"><button class="icon-btn" type="button" data-action="notification" title="Notifications">♢${unread?`<span class="notification-dot">${unread>9?"9+":unread}</span>`:""}</button>${state.notificationsOpen?notificationPanel():""}</div>
              <div class="profile-wrap"><button class="profile profile-button" type="button" data-action="profile-menu"><div class="avatar">${esc(initials(state.account.name))}</div><div class="hide-mobile"><strong style="font-size:12px">${esc(state.account.name)}</strong><div class="small-text muted">${esc(state.account.role)}</div></div><span class="profile-chevron">⌄</span></button>${state.showProfileMenu?profileMenu():""}</div>
            </div>
          </header>
          <section class="content">${content}</section>
        </main>
      </div>
      <div class="modal-backdrop ${state.modal?'open':''}" id="modalBackdrop">${state.modal?modalMarkup():""}</div>
      <div class="toast" id="toast" aria-live="polite"></div>`;
    bind();
  }
  function authMarkup(){
    if(state.authView==="signup") return `<div class="auth-shell"><div class="auth-brand"><div class="brand-mark">M</div><div><strong>MotoCare AI</strong><small>Shop Management System</small></div></div><div class="auth-card"><div class="auth-head"><h1>Create Staff Account</h1><p>Set up an account for the MotoCare AI staff portal.</p></div><form data-auth-form="signup"><div class="form-grid">${field("Full Name","name","","text",true)}${field("Email","email","","email",true)}${field("Password","password","","password",true)}${field("Confirm Password","confirm","","password",true)}</div><div class="auth-note">Prototype only: accounts are stored locally in this browser.</div><button class="btn primary auth-submit">Create Account</button></form><div class="auth-switch">Already have an account? <button type="button" class="link-btn" data-auth-view="login">Sign in</button></div></div><div class="auth-footer">MotoCare AI · Owner / Staff Portal · Prototype</div><div class="toast" id="toast"></div></div>`;
    if(state.authView==="forgot") return `<div class="auth-shell"><div class="auth-brand"><div class="brand-mark">M</div><div><strong>MotoCare AI</strong><small>Shop Management System</small></div></div><div class="auth-card"><div class="auth-head"><h1>Reset Password</h1><p>Enter your staff email and we'll simulate a password reset request.</p></div><form data-auth-form="forgot">${field("Staff Email","email",state.account.email||"","email",true)}<button class="btn primary auth-submit">Send Reset Link</button></form><div class="auth-switch"><button type="button" class="link-btn" data-auth-view="login">← Back to sign in</button></div></div><div class="auth-footer">MotoCare AI · Owner / Staff Portal · Prototype</div><div class="toast" id="toast"></div></div>`;
    return `<div class="auth-shell"><div class="auth-brand"><div class="brand-mark">M</div><div><strong>MotoCare AI</strong><small>Shop Management System</small></div></div><div class="auth-card"><div class="auth-head"><h1>Staff Portal</h1><p>Sign in to manage the motorcycle shop.</p></div><form data-auth-form="login">${field("Email","email",state.account.email||"admin@motocare.ai","email",true)}${field("Password","password","","password",true)}<div class="auth-row"><label class="check"><input type="checkbox" name="remember" checked> Remember me</label><button type="button" class="link-btn" data-auth-view="forgot">Forgot password?</button></div><button class="btn primary auth-submit">Sign In</button></form><div class="demo-login"><strong>Prototype demo</strong><span>admin@motocare.ai</span><span>admin123</span></div><div class="auth-switch">Need a staff account? <button type="button" class="link-btn" data-auth-view="signup">Create one</button></div></div><div class="auth-footer">MotoCare AI · Owner / Staff Portal · Prototype</div><div class="toast" id="toast"></div></div>`;
  }
  function profileMenu(){return `<div class="profile-menu"><div class="profile-menu-head"><div class="avatar">${esc(initials(state.account.name))}</div><div><strong>${esc(state.account.name)}</strong><span>${esc(state.account.email)}</span></div></div><button type="button" data-action="account-settings">Profile & Account</button><button type="button" data-action="change-password">Change Password</button><div class="profile-divider"></div><button type="button" class="logout-btn" data-action="logout">Log Out</button></div>`}
  function notificationPanel(){return `<div class="notification-panel"><div class="notification-head"><strong>Notifications</strong><button type="button" class="link-btn" data-action="mark-notifications">Mark all read</button></div>${state.notifications.map(n=>`<button type="button" class="notification-item ${n.read?'read':''}" data-action="read-notification" data-id="${n.id}"><span class="notification-icon">•</span><span><strong>${esc(n.title)}</strong><small>${esc(n.text)}</small><em>${esc(n.time)}</em></span></button>`).join("")}</div>`}

  function pageTitle(){
    const found = nav.find(x=>x[0]===state.page);
    return found ? found[2] : "Details";
  }

  function pageHead(title,desc,actions=""){
    return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div><div class="actions">${actions}</div></div>`;
  }

  function dashboard(){
    const bars=[58,76,54,88,68,94,72];
    return pageHead("Dashboard","Overview of your motorcycle shop today.",
      `<button class="btn" data-action="go" data-page="appointments">View Appointments</button><button class="btn primary" data-action="go" data-page="pos">New Sale</button>`) +
      `<div class="cards">
        ${stat("Customers","1,284","↗ 8.4% this month","♙")}
        ${stat("Motorcycles","1,672","↗ 6.1% this month","◈")}
        ${stat("Today's Appointments","12","4 pending","◷")}
        ${stat("Today's Sales","₱24,850","↗ 12.8% today","₱")}
      </div>
      <div class="grid-2">
        <div class="card panel"><div class="panel-head"><h2>Weekly Sales</h2><span class="small-text muted">September 20–26</span></div>
          <div class="chart">${bars.map((v,i)=>`<div class="bar-wrap"><div class="bar" style="height:${v}%"></div><span class="bar-label">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]}</span></div>`).join("")}</div>
        </div>
        <div class="card panel"><div class="panel-head"><h2>Today's Appointments</h2><button class="link-btn" data-action="go" data-page="appointments">View all</button></div>
          <div class="list">${data.appointments.filter(a=>a.date==="2026-09-26").slice(0,4).map(a=>`
            <div class="list-row"><div class="person"><div class="mini-avatar">${initials(a.customer)}</div><div><strong>${esc(a.customer)}</strong><span>${esc(a.time)} · ${esc(a.service)}</span></div></div>${badge(a.status)}</div>`).join("")}</div>
        </div>
      </div>
      <div class="grid-3" style="margin-top:18px">
        <div class="card panel"><div class="panel-head"><h2>Repair Status</h2><button class="link-btn" data-action="go" data-page="repairs">Manage</button></div>
          ${["Pending","Ongoing","Completed"].map((s,i)=>`<div class="list-row"><span>${s}</span><strong>${[5,7,31][i]}</strong></div>`).join("")}
        </div>
        <div class="card panel"><div class="panel-head"><h2>Low Stock</h2><button class="link-btn" data-action="go" data-page="inventory">Inventory</button></div>
          ${data.inventory.filter(x=>x.stock<=x.reorder).map(x=>`<div class="list-row"><span>${esc(x.name)}</span>${badge(x.stock+" left")}</div>`).join("")}
        </div>
        <div class="card panel"><div class="panel-head"><h2>Top Services</h2><span class="small-text muted">This month</span></div>
          ${[["Periodic Maintenance",86],["General Checkup",64],["Brake Service",51],["Chain Adjustment",39]].map(x=>`<div class="list-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("")}
        </div>
      </div>`;
  }

  function stat(label,value,trend,icon){return `<div class="card stat"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="trend">${trend}</div></div>`}

  function customers(){
    const q=state.search.toLowerCase();
    const rows=data.customers.filter(c=>(!q || `${c.name} ${c.phone} ${c.email} ${c.id}`.toLowerCase().includes(q)) && (state.customerFilter==="All"||c.status===state.customerFilter));
    return pageHead("Customers","Manage customer profiles and their motorcycle records.",
      `<button class="btn primary" data-action="open-add" data-type="customer">+ Add Customer</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search customers..." value="${esc(state.search)}"><select class="select" id="filter"><option>All</option><option>Active</option><option>Inactive</option></select></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Motorcycles</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${rows.length?rows.map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><span class="small-text muted">${c.id}</span></td><td>${esc(c.phone)}</td><td>${esc(c.email)}</td><td>${c.motorcycles}</td><td>${badge(c.status)}</td><td><button class="link-btn" data-action="customer-detail" data-id="${c.id}">View</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No customers found.</td></tr>`}
      </tbody></table></div></div>`;
  }

  function customerDetail(){
    const c=data.customers.find(x=>x.id===state.selectedCustomer)||data.customers[0];
    const bikes=data.motorcycles.filter(m=>m.owner===c.name);
    return pageHead(c.name,`${c.id} · Customer profile`,
      `<button class="btn" data-action="go" data-page="customers">← Back</button><button class="btn" data-action="open-edit" data-type="customer" data-id="${c.id}">Edit Customer</button><button class="btn primary" data-action="open-add" data-type="motorcycle" data-owner="${esc(c.name)}">+ Add Motorcycle</button>`) +
      `<div class="detail-grid">
        <div class="card panel"><div class="panel-head"><h2>Personal Information</h2></div><div class="info-list">
          ${info("Customer ID",c.id)}${info("Full Name",c.name)}${info("Phone",c.phone)}${info("Email",c.email)}${info("Address",c.address)}${info("Status",badge(c.status))}
        </div></div>
        <div class="card panel"><div class="panel-head"><h2>Registered Motorcycles</h2><button class="link-btn" data-action="open-add" data-type="motorcycle" data-owner="${esc(c.name)}">Add</button></div>
          ${bikes.length?`<div class="list">${bikes.map(m=>`<div class="list-row"><div><strong>${esc(m.brand+" "+m.model)}</strong><div class="small-text muted">${esc(m.plate)} · ${esc(m.mileage)}</div></div><button class="link-btn" data-action="motorcycle-detail" data-id="${m.id}">View</button></div>`).join("")}</div>`:`<div class="empty">No motorcycles registered.</div>`}
        </div>
        <div class="card panel"><div class="panel-head"><h2>Service History</h2><button class="link-btn" data-action="open-add" data-type="repair">New Service</button></div>
          <div class="timeline"><div class="timeline-item"><strong>Sep 05, 2026 · Chain Adjustment</strong><p>Completed by Ramon Cruz · ₱450</p></div><div class="timeline-item"><strong>Jul 11, 2026 · Preventive Maintenance</strong><p>Completed · ₱1,850</p></div><div class="timeline-item"><strong>Apr 08, 2026 · General Checkup</strong><p>Completed · ₱400</p></div></div>
        </div>
        <div class="card panel"><div class="panel-head"><h2>Appointment History</h2><button class="link-btn" data-action="go" data-page="appointments">View all</button></div>
          ${data.appointments.filter(a=>a.customer===c.name).map(a=>`<div class="list-row"><div><strong>${esc(a.service)}</strong><div class="small-text muted">${a.date} · ${a.time}</div></div>${badge(a.status)}</div>`).join("") || `<div class="empty">No appointment history.</div>`}
        </div>
      </div>`;
  }

  function motorcycles(){
    const q=state.search.toLowerCase();
    const rows=data.motorcycles.filter(m=>!q||`${m.brand} ${m.model} ${m.owner} ${m.plate}`.toLowerCase().includes(q));
    return pageHead("Motorcycles","Track registered motorcycles, mileage, and maintenance history.",
      `<button class="btn primary" data-action="open-add" data-type="motorcycle">+ Add Motorcycle</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search motorcycle, owner, plate..." value="${esc(state.search)}"><select class="select"><option>All Brands</option><option>Honda</option><option>Yamaha</option><option>Suzuki</option></select></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Motorcycle</th><th>Owner</th><th>Year</th><th>Plate</th><th>Mileage</th><th>Next Service</th><th>Action</th></tr></thead><tbody>
      ${rows.map(m=>`<tr><td><strong>${esc(m.brand+" "+m.model)}</strong><br><span class="small-text muted">${m.id}</span></td><td>${esc(m.owner)}</td><td>${m.year}</td><td>${m.plate}</td><td>${m.mileage}</td><td>${m.nextService}</td><td><button class="link-btn" data-action="motorcycle-detail" data-id="${m.id}">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function motorcycleDetail(){
    const m=data.motorcycles.find(x=>x.id===state.selectedMotorcycle)||data.motorcycles[0];
    return pageHead(`${m.brand} ${m.model}`,`${m.id} · Motorcycle record`,
      `<button class="btn" data-action="go" data-page="motorcycles">← Back</button><button class="btn" data-action="open-edit" data-type="motorcycle" data-id="${m.id}">Edit Motorcycle</button><button class="btn primary" data-action="open-add" data-type="repair">+ Create Service</button>`) +
      `<div class="grid-2"><div class="card panel"><div class="panel-head"><h2>Motorcycle Information</h2></div><div class="info-list">${info("Owner",m.owner)}${info("Brand",m.brand)}${info("Model",m.model)}${info("Year",m.year)}${info("Plate Number",m.plate)}${info("Current Mileage",m.mileage)}${info("Chassis Number",m.chassis)}${info("Engine Number",m.engine)}</div></div>
      <div class="card panel"><div class="panel-head"><h2>Maintenance Information</h2></div><div class="info-list">${info("Last Service",m.lastService)}${info("Next Recommended Service",m.nextService)}${info("Maintenance Status",badge("Due Soon"))}${info("Service Interval","Every 3 months / 5,000 km")}</div></div></div>
      <div class="card panel" style="margin-top:18px"><div class="panel-head"><h2>Service History</h2><button class="link-btn" data-action="go" data-page="repairs">View repairs</button></div><div class="timeline"><div class="timeline-item"><strong>Sep 05, 2026 · Chain Adjustment</strong><p>Completed · Ramon Cruz · ₱450</p></div><div class="timeline-item"><strong>Jul 11, 2026 · Preventive Maintenance</strong><p>Completed · Leo Mendoza · ₱1,850</p></div><div class="timeline-item"><strong>Apr 08, 2026 · General Checkup</strong><p>Completed · ₱400</p></div></div></div>`;
  }

  function info(label,value){return `<div class="info-item"><label>${label}</label><strong>${value}</strong></div>`}

  function appointments(){
    const q=state.search.toLowerCase();
    const rows=data.appointments.filter(a=>(!q||`${a.id} ${a.customer} ${a.motorcycle} ${a.service}`.toLowerCase().includes(q))&&(state.statusFilter==="All"||a.status===state.statusFilter));
    return pageHead("Appointments","Schedule and manage customer service appointments.",
      `<button class="btn" data-action="go" data-page="appointment-calendar">Calendar</button><button class="btn primary" data-action="open-add" data-type="appointment">+ New Appointment</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search appointments..." value="${esc(state.search)}"><select class="select" id="filter"><option>All</option><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Time</th><th>Customer</th><th>Motorcycle</th><th>Service</th><th>Mechanic</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${rows.map(a=>`<tr><td>${a.id}</td><td>${a.time}<br><span class="small-text muted">${a.date}</span></td><td>${esc(a.customer)}</td><td>${esc(a.motorcycle)}</td><td>${esc(a.service)}</td><td>${esc(a.mechanic)}</td><td>${badge(a.status)}</td><td><button class="link-btn" data-action="appointment-detail" data-id="${a.id}">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function calendar(){
    const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const cells=[];
    for(let i=0;i<35;i++){
      const d=i-6;
      const date=new Date(Date.UTC(2026,8,d));
      const iso=date.toISOString().slice(0,10);
      const events=data.appointments.filter(a=>a.date===iso);
      cells.push(`<div class="day ${iso==="2026-09-26"?"today":""}"><div class="day-number">${date.getUTCDate()}</div>${events.map(e=>`<div class="event" data-action="appointment-detail" data-id="${e.id}">${esc(e.time)} ${esc(e.customer.split(" ")[0])}</div>`).join("")}</div>`);
    }
    return pageHead("Appointment Calendar","September 2026 · monthly schedule",
      `<button class="btn" data-action="go" data-page="appointments">← List View</button><button class="btn primary" data-action="open-add" data-type="appointment">+ New Appointment</button>`) +
      `<div class="card panel calendar-wrap"><div class="calendar">${days.map(d=>`<div class="cal-head">${d}</div>`).join("")}${cells.join("")}</div></div>`;
  }

  function repairs(){
    const q=state.search.toLowerCase();
    const rows=data.repairs.filter(r=>(!q||`${r.id} ${r.customer} ${r.motorcycle} ${r.service}`.toLowerCase().includes(q))&&(state.statusFilter==="All"||r.status===state.statusFilter));
    return pageHead("Repairs & Services","Track service requests from inspection through completion.",
      `<button class="btn primary" data-action="open-add" data-type="repair">+ New Repair</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search repair or customer..." value="${esc(state.search)}"><select class="select" id="filter"><option>All</option><option>Received</option><option>Inspection</option><option>Ongoing</option><option>Completed</option></select></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Request</th><th>Customer</th><th>Motorcycle</th><th>Service</th><th>Mechanic</th><th>Status</th><th>Estimate</th><th>Action</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td>${r.id}</td><td>${esc(r.customer)}</td><td>${esc(r.motorcycle)}</td><td>${esc(r.service)}</td><td>${esc(r.mechanic)}</td><td>${badge(r.status)}</td><td>${money(r.estimate)}</td><td><button class="link-btn" data-action="repair-detail" data-id="${r.id}">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function repairDetail(){
    const r=data.repairs.find(x=>x.id===state.selectedRepair)||data.repairs[0];
    const steps=["Received","Inspection","Ongoing","Completed"], idx=Math.max(0,steps.indexOf(r.status));
    return pageHead(`${r.service}`,`${r.id} · Repair work order`,
      `<button class="btn" data-action="go" data-page="repairs">← Back</button><button class="btn" data-action="assign-mechanic" data-id="${r.id}">Assign Mechanic</button><button class="btn primary" data-action="repair-status" data-id="${r.id}">Update Status</button>`) +
      `<div class="card panel"><div class="panel-head"><h2>Repair Progress</h2>${badge(r.status)}</div><div class="progress">${steps.map((s,i)=>`<div class="step ${i<idx?"done":i===idx?"current":""}"><div class="step-dot"></div>${s}</div>`).join("")}</div></div>
      <div class="grid-2" style="margin-top:18px"><div class="card panel"><div class="panel-head"><h2>Service Details</h2></div><div class="info-list">${info("Customer",r.customer)}${info("Motorcycle",r.motorcycle)}${info("Assigned Mechanic",r.mechanic)}${info("Estimated Total",money(r.estimate))}${info("Customer Concern",r.concern)}${info("Notes",r.notes)}</div></div>
      <div class="card panel"><div class="panel-head"><h2>Parts Used</h2><button class="link-btn" data-action="add-part" data-id="${r.id}">+ Add Part</button></div>${r.parts.length?r.parts.map(p=>`<div class="list-row"><span>${esc(p)}</span><span class="small-text muted">1 ×</span></div>`).join(""):`<div class="empty">No parts recorded yet.</div>`}</div></div>
      <div class="card panel" style="margin-top:18px"><div class="panel-head"><h2>Repair Timeline</h2></div><div class="timeline"><div class="timeline-item"><strong>Service request created</strong><p>Sep 26, 2026 · 8:40 AM</p></div><div class="timeline-item"><strong>Mechanic assigned</strong><p>${esc(r.mechanic)} · 8:55 AM</p></div><div class="timeline-item"><strong>Inspection notes recorded</strong><p>Parts and labor estimate prepared.</p></div></div></div>`;
  }

  function mechanics(){
    const q=state.search.toLowerCase();
    const rows=data.mechanics.filter(m=>!q||`${m.name} ${m.specialization}`.toLowerCase().includes(q));
    return pageHead("Mechanics","Manage mechanic profiles, assignments, and workload.",
      `<button class="btn primary" data-action="open-add" data-type="mechanic">+ Add Mechanic</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search mechanics..." value="${esc(state.search)}"></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Mechanic</th><th>Specialization</th><th>Active Jobs</th><th>Status</th><th>Completed Jobs</th><th>Action</th></tr></thead><tbody>
      ${rows.map(m=>`<tr><td><strong>${esc(m.name)}</strong><br><span class="small-text muted">${m.id} · ${m.contact}</span></td><td>${esc(m.specialization)}</td><td>${m.activeJobs}</td><td>${badge(m.status)}</td><td>${m.completed}</td><td><button class="link-btn" data-action="mechanic-detail" data-id="${m.id}">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function mechanicDetail(){
    const m=data.mechanics.find(x=>x.id===state.selectedMechanic)||data.mechanics[0];
    return pageHead(m.name,`${m.id} · mechanic profile`,
      `<button class="btn" data-action="go" data-page="mechanics">← Back</button><button class="btn" data-action="open-edit" data-type="mechanic" data-id="${m.id}">Edit Profile</button>`) +
      `<div class="grid-2"><div class="card panel"><div class="panel-head"><h2>Profile</h2></div><div class="info-list">${info("Name",m.name)}${info("Contact",m.contact)}${info("Specialization",m.specialization)}${info("Status",badge(m.status))}</div></div>
      <div class="card panel"><div class="panel-head"><h2>Performance</h2></div><div class="cards" style="grid-template-columns:repeat(3,1fr);margin:0">${stat("Jobs Completed",m.completed,"All time","✓")}${stat("Active Jobs",m.activeJobs,"Current","⚙")}${stat("Avg. Time","2.4 hrs","Last 30 days","◷")}</div></div></div>
      <div class="card panel" style="margin-top:18px"><div class="panel-head"><h2>Current Work</h2><button class="link-btn" data-action="go" data-page="repairs">Open repairs</button></div>
      ${data.repairs.filter(r=>r.mechanic===m.name && r.status!=="Completed").map(r=>`<div class="list-row"><div><strong>${esc(r.service)}</strong><div class="small-text muted">${esc(r.customer)} · ${esc(r.motorcycle)}</div></div>${badge(r.status)}</div>`).join("") || `<div class="empty">No active work.</div>`}</div>`;
  }

  function inventory(){
    const q=state.search.toLowerCase();
    const rows=data.inventory.filter(i=>(!q||`${i.name} ${i.sku} ${i.category}`.toLowerCase().includes(q))&&(state.inventoryFilter==="All"||state.inventoryFilter==="Low Stock"&&i.stock<=i.reorder||state.inventoryFilter==="In Stock"&&i.stock>i.reorder));
    return pageHead("Inventory","Manage parts, stock levels, suppliers, and reorder points.",
      `<button class="btn primary" data-action="open-add" data-type="inventory">+ Add Item</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input search" id="search" placeholder="Search inventory..." value="${esc(state.search)}"><select class="select" id="filter"><option>All</option><option>Low Stock</option><option>In Stock</option></select></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Unit Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${rows.map(i=>`<tr><td>${i.sku}</td><td><strong>${esc(i.name)}</strong></td><td>${esc(i.category)}</td><td>${i.stock}</td><td>${i.reorder}</td><td>${money(i.price)}</td><td>${i.stock<=i.reorder?badge("Low Stock"):badge("In Stock")}</td><td><button class="link-btn" data-action="item-detail" data-id="${i.id}">View</button></td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function itemDetail(){
    const i=data.inventory.find(x=>x.id===state.selectedItem)||data.inventory[0];
    return pageHead(i.name,`${i.id} · ${i.sku}`,
      `<button class="btn" data-action="go" data-page="inventory">← Back</button><button class="btn" data-action="open-edit" data-type="inventory" data-id="${i.id}">Edit Item</button><button class="btn primary" data-action="stock" data-id="${i.id}">+ Add Stock</button>`) +
      `<div class="grid-2"><div class="card panel"><div class="panel-head"><h2>Item Information</h2></div><div class="info-list">${info("Item Name",i.name)}${info("SKU",i.sku)}${info("Category",i.category)}${info("Supplier",i.supplier)}${info("Unit Price",money(i.price))}${info("Stock Status",i.stock<=i.reorder?badge("Low Stock"):badge("In Stock"))}</div></div>
      <div class="card panel"><div class="panel-head"><h2>Stock Overview</h2></div><div class="cards" style="grid-template-columns:repeat(2,1fr);margin:0">${stat("Current Stock",i.stock,"Units available","▤")}${stat("Reorder Level",i.reorder,"Minimum level","!")}</div></div></div>
      <div class="card panel" style="margin-top:18px"><div class="panel-head"><h2>Inventory History</h2><button class="link-btn" data-action="stock" data-id="${i.id}">Adjust Stock</button></div>
      <table class="table"><thead><tr><th>Date</th><th>Transaction</th><th>Quantity</th><th>Remaining</th></tr></thead><tbody><tr><td>Sep 26, 2026</td><td>Stock issued to repair</td><td>-1</td><td>${i.stock}</td></tr><tr><td>Sep 18, 2026</td><td>Purchase received</td><td>+10</td><td>${i.stock+1}</td></tr><tr><td>Sep 02, 2026</td><td>Stock issued to repair</td><td>-2</td><td>${i.stock-9}</td></tr></tbody></table></div>`;
  }

  function pos(){
    const subtotal=state.cart.reduce((s,x)=>s+x.price*x.qty,0);
    return pageHead("Sales & POS","Create a sale for services and parts.",
      `<button class="btn" data-action="clear-cart">Clear Sale</button>`) +
      `<div class="pos"><div class="card panel"><div class="panel-head"><h2>Products & Services</h2><span class="small-text muted">Click an item to add it</span></div><div class="toolbar"><input class="input" id="posSearch" placeholder="Search products/services..."></div><div class="product-grid" id="productGrid">${data.products.map(p=>`<button class="product" type="button" data-action="add-cart" data-id="${p.id}"><div class="product-name">${esc(p.name)}</div><div class="product-meta">${p.category}</div><div class="product-price">${money(p.price)}</div></button>`).join("")}</div></div>
      <div class="card panel"><div class="panel-head"><h2>Current Sale</h2><span class="small-text muted">${state.cart.length} item(s)</span></div>
        <div class="field"><label>Customer</label><select class="select"><option>Walk-in Customer</option>${data.customers.map(c=>`<option>${esc(c.name)}</option>`).join("")}</select></div>
        <div style="margin-top:14px">${state.cart.length?state.cart.map(x=>`<div class="cart-item"><div><strong>${esc(x.name)}</strong><div class="small-text muted">${money(x.price)} each</div></div><div class="qty"><button type="button" data-action="qty" data-id="${x.id}" data-delta="-1">−</button><span>${x.qty}</span><button type="button" data-action="qty" data-id="${x.id}" data-delta="1">+</button></div></div>`).join(""):`<div class="empty">Cart is empty.</div>`}</div>
        <div class="totals"><div class="total-line"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="total-line"><span>Discount</span><span>₱0.00</span></div><div class="total-line grand"><span>Total</span><span>${money(subtotal)}</span></div><button class="btn primary" style="width:100%;margin-top:12px" ${state.cart.length?"":"disabled"} data-action="payment">Proceed to Payment</button></div>
      </div></div>`;
  }

  function reports(){
    return pageHead("Reports","Review shop performance and generate management reports.",
      `<button class="btn" data-action="report-export">Export Current Report</button>`) +
      `<div class="cards">${stat("Monthly Revenue","₱428,650","September 2026","₱")}${stat("Services Completed","186","This month","✓")}${stat("Parts Sold","342","This month","▤")}${stat("New Customers","73","This month","♙")}</div>
      <div class="card panel"><div class="panel-head"><h2>Revenue Overview</h2><span class="small-text muted">Monthly</span></div><div class="chart">${[42,51,63,56,72,81,68,91,76,84,94,87].map((v,i)=>`<div class="bar-wrap"><div class="bar" style="height:${v}%"></div><span class="bar-label">${["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"][i]}</span></div>`).join("")}</div></div>
      <div class="card panel" style="margin-top:18px"><div class="panel-head"><h2>Report Center</h2><span class="small-text muted">Choose a detailed report</span></div><div class="report-cards">
      ${reportCard("sales-report","Sales Report","Revenue, transactions, payment methods, and totals.")}
      ${reportCard("service-report","Service Performance","Completed services, common services, and status.")}
      ${reportCard("inventory-report","Inventory Movement","Stock received, issued, and low-stock items.")}
      ${reportCard("customer-report","Customer Activity","New customers, repeat visits, and service activity.")}
      ${reportCard("mechanic-report","Mechanic Productivity","Workload, completed jobs, and completion times.")}
      ${reportCard("financial-report","Financial Summary","Revenue and high-level operating figures.")}</div></div>`;
  }
  function reportCard(id,title,desc){return `<button class="report-link" type="button" data-action="report" data-report="${id}"><strong>${title}</strong><p>${desc}</p></button>`}

  function reportPage(){
    const configs={
      "sales-report":["Sales Report","Sep 1–26, 2026",["Date","Invoice","Customer","Payment","Amount"],[["09/26/26","INV-5012","Juan Dela Cruz","GCash","₱1,850"],["09/26/26","INV-5011","Walk-in Customer","Cash","₱850"],["09/25/26","INV-5010","Carlo Reyes","Card","₱450"],["09/24/26","INV-5009","Miguel Santos","GCash","₱1,240"]]],
      "service-report":["Service Performance","September 2026",["Service","Completed","Ongoing","Revenue"],[["Periodic Maintenance","86","7","₱159,100"],["General Checkup","64","3","₱25,600"],["Brake Inspection","51","4","₱25,500"],["Chain Adjustment","39","2","₱17,550"]]],
      "inventory-report":["Inventory Movement","September 2026",["Item","Received","Issued","Remaining"],[["Engine Oil 10W-40","40","22","18"],["Oil Filter — Honda","25","18","7"],["Brake Shoe Set","30","6","24"],["Chain Lube","20","8","12"]]],
      "customer-report":["Customer Activity","September 2026",["Customer","Visits","Motorcycles","Last Service"],[["Juan Dela Cruz","5","2","09/26/26"],["Miguel Santos","3","1","09/26/26"],["Carlo Reyes","2","1","09/25/26"],["Mark Villanueva","4","3","09/21/26"]]],
      "mechanic-report":["Mechanic Productivity","September 2026",["Mechanic","Completed","Ongoing","Avg. Time"],[["Ramon Cruz","42","2","2.1 hrs"],["Leo Mendoza","36","1","2.6 hrs"],["Kevin Flores","28","0","2.4 hrs"]]],
      "financial-report":["Financial Summary","September 2026",["Category","Transactions","Amount","Share"],[["Services","186","₱316,450","73.8%"],["Parts","342","₱112,200","26.2%"],["Discounts","41","-₱8,400","—"],["Net Revenue","—","₱420,250","100%"]]]
    };
    const c=configs[state.report]||configs["sales-report"];
    return pageHead(c[0],c[1],`<button class="btn" data-action="go" data-page="reports">← Reports</button><button class="btn primary" data-action="report-export">Export PDF</button>`) +
      `<div class="card panel"><div class="toolbar"><input class="input" placeholder="Filter report..."><select class="select"><option>All</option><option>This Month</option><option>Last Month</option></select></div><div class="table-wrap"><table class="table"><thead><tr>${c[2].map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${c[3].map(row=>`<tr>${row.map((x,i)=>`<td>${i===0?`<strong>${x}</strong>`:x}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
  }

  function accountPage(){return pageHead("Profile & Account","Manage the staff account used to access MotoCare AI.",`<button class="btn primary" data-action="change-password">Change Password</button>`)+`<div class="detail-grid"><div class="card panel"><div class="panel-head"><h2>Account Information</h2></div><div class="account-profile"><div class="account-avatar">${esc(initials(state.account.name))}</div><div><strong>${esc(state.account.name)}</strong><span>${esc(state.account.role)}</span></div></div><div class="info-list account-info">${info("Full Name",esc(state.account.name))}${info("Email",esc(state.account.email))}${info("Role",esc(state.account.role))}${info("Account Status",badge("Active"))}</div><button class="btn" data-action="edit-account">Edit Profile</button></div><div class="card panel"><div class="panel-head"><h2>Security</h2></div><div class="list"><div class="list-row"><div><strong>Password</strong><div class="small-text muted">Keep your staff account secure.</div></div><button class="link-btn" data-action="change-password">Change</button></div><div class="list-row"><div><strong>Session</strong><div class="small-text muted">Current browser session is active.</div></div>${badge("Active")}</div></div></div></div>`}
  function modalMarkup(){
    const type=state.modal.type, edit=state.modal.edit||null;
    const title=edit?"Edit ":"Add ";
    let body="";
    if(type==="customer") body=formCustomer(edit,title);
    if(type==="motorcycle") body=formMotorcycle(edit,title);
    if(type==="appointment") body=formAppointment(edit,title);
    if(type==="repair") body=formRepair(edit,title);
    if(type==="mechanic") body=formMechanic(edit,title);
    if(type==="inventory") body=formInventory(edit,title);
    if(type==="payment") body=formPayment();
    if(type==="stock") body=formStock();
    if(type==="part") body=formPart();
    if(type==="assign") body=formAssign();
    if(type==="status") body=formStatus();
    if(type==="account") body=formAccount();
    if(type==="password") body=formPassword();
    return `<div class="modal ${["appointment","repair"].includes(type)?"large":""}" role="dialog" aria-modal="true"><div class="modal-head"><h2>${modalTitle(type,edit)}</h2><button class="close" type="button" data-action="close-modal">×</button></div><div class="modal-body">${body}</div></div>`;
  }
  function modalTitle(type,edit){const map={customer:"Customer",motorcycle:"Motorcycle",appointment:"Appointment",repair:"Repair / Service",mechanic:"Mechanic",inventory:"Inventory Item",payment:"Payment",stock:"Add / Adjust Stock",part:"Add Part",assign:"Assign Mechanic",status:"Update Repair Status",account:"Edit Profile",password:"Change Password"};return (edit?"Edit ":"")+(map[type]||"Action");}
  function formCustomer(e,title){return `<form data-form="customer"><div class="form-grid">${field("Full Name","name",e?.name||"","text",true)}${field("Phone","phone",e?.phone||"","text",true)}${field("Email","email",e?.email||"","email",true)}${field("Address","address",e?.address||"","text",false)}<div class="field"><label>Status</label><select class="select" name="status"><option>Active</option><option ${e?.status==="Inactive"?"selected":""}>Inactive</option></select></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Customer</button></div></form>`}
  function formMotorcycle(e,title){return `<form data-form="motorcycle"><div class="form-grid">${field("Owner","owner",e?.owner||state.modal.owner||"","text",true)}${field("Brand","brand",e?.brand||"Honda","text",true)}${field("Model","model",e?.model||"","text",true)}${field("Year","year",e?.year||"2026","number",true)}${field("Plate Number","plate",e?.plate||"","text",true)}${field("Current Mileage","mileage",e?.mileage||"0 km","text",true)}${field("Chassis Number","chassis",e?.chassis||"","text",false)}${field("Engine Number","engine",e?.engine||"","text",false)}</div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Motorcycle</button></div></form>`}
  function formAppointment(e){return `<form data-form="appointment"><div class="form-grid"><div class="field"><label>Customer</label><select class="select" name="customer">${data.customers.map(c=>`<option ${e?.customer===c.name?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div>${field("Motorcycle","motorcycle",e?.motorcycle||"","text",true)}${field("Date","date",e?.date||"2026-09-26","date",true)}${field("Time","time",e?.time||"09:00","time",true)}${field("Requested Service","service",e?.service||"","text",true)}<div class="field"><label>Mechanic</label><select class="select" name="mechanic"><option>Unassigned</option>${data.mechanics.map(m=>`<option ${e?.mechanic===m.name?"selected":""}>${esc(m.name)}</option>`).join("")}</select></div><div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="3">${esc(e?.notes||"")}</textarea></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Appointment</button></div></form>`}
  function formRepair(e){return `<form data-form="repair"><div class="form-grid">${field("Customer","customer",e?.customer||"","text",true)}${field("Motorcycle","motorcycle",e?.motorcycle||"","text",true)}${field("Service","service",e?.service||"","text",true)}<div class="field"><label>Mechanic</label><select class="select" name="mechanic"><option>Unassigned</option>${data.mechanics.map(m=>`<option ${e?.mechanic===m.name?"selected":""}>${esc(m.name)}</option>`).join("")}</select></div>${field("Customer Concern","concern",e?.concern||"","text",false)}${field("Estimated Cost","estimate",e?.estimate||"","number",false)}<div class="field full"><label>Notes</label><textarea class="textarea" name="notes" rows="3">${esc(e?.notes||"")}</textarea></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Repair</button></div></form>`}
  function formMechanic(e){return `<form data-form="mechanic"><div class="form-grid">${field("Name","name",e?.name||"","text",true)}${field("Contact","contact",e?.contact||"","text",true)}${field("Specialization","specialization",e?.specialization||"","text",true)}<div class="field"><label>Status</label><select class="select" name="status"><option>Available</option><option>Busy</option><option>Inactive</option></select></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Mechanic</button></div></form>`}
  function formInventory(e){return `<form data-form="inventory"><div class="form-grid">${field("Item Name","name",e?.name||"","text",true)}${field("SKU","sku",e?.sku||"","text",true)}${field("Category","category",e?.category||"","text",true)}${field("Supplier","supplier",e?.supplier||"","text",false)}${field("Initial Stock","stock",e?.stock||0,"number",true)}${field("Reorder Level","reorder",e?.reorder||5,"number",true)}${field("Unit Price","price",e?.price||0,"number",true)}</div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Item</button></div></form>`}
  function formPayment(){const total=state.cart.reduce((s,x)=>s+x.price*x.qty,0);return `<form data-form="payment"><div class="info-item" style="margin-bottom:15px"><label>Total Amount</label><strong style="font-size:24px">${money(total)}</strong></div><div class="form-grid"><div class="field"><label>Payment Method</label><select class="select" name="method"><option>Cash</option><option>GCash</option><option>Card</option></select></div>${field("Amount Received","received",total,"number",true)}</div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn success">Complete Payment</button></div></form>`}
  function formStock(){return `<form data-form="stock"><div class="form-grid">${field("Quantity","quantity",1,"number",true)}<div class="field"><label>Transaction</label><select class="select" name="transaction"><option>Stock Received</option><option>Stock Adjustment</option></select></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Update Stock</button></div></form>`}
  function formPart(){return `<form data-form="part"><div class="form-grid"><div class="field full"><label>Part</label><select class="select" name="part">${data.inventory.map(i=>`<option value="${i.name}">${esc(i.name)} — ${money(i.price)}</option>`).join("")}</select></div>${field("Quantity","quantity",1,"number",true)}</div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Add Part</button></div></form>`}
  function formAssign(){return `<form data-form="assign"><div class="field"><label>Mechanic</label><select class="select" name="mechanic">${data.mechanics.map(m=>`<option>${esc(m.name)}</option>`).join("")}</select></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Assign</button></div></form>`}
  function formStatus(){return `<form data-form="status"><div class="field"><label>Repair Status</label><select class="select" name="status"><option>Received</option><option>Inspection</option><option>Ongoing</option><option>Completed</option></select></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Update Status</button></div></form>`}
  function formAccount(){return `<form data-form="account"><div class="form-grid">${field("Full Name","name",state.account.name,"text",true)}${field("Email","email",state.account.email,"email",true)}<div class="field"><label>Role</label><input class="input" value="${esc(state.account.role)}" disabled></div></div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Save Profile</button></div></form>`}
  function formPassword(){return `<form data-form="password"><div class="form-grid">${field("Current Password","current","","password",true)}${field("New Password","password","","password",true)}${field("Confirm New Password","confirm","","password",true)}</div><div class="auth-note">Prototype only: this simulates password changes locally.</div><div class="form-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary">Change Password</button></div></form>`}
  function field(label,name,value="",type="text",required=false){return `<div class="field"><label>${label}${required?" *":""}</label><input class="input" name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""}></div>`}

  function bindAuth(){app.querySelectorAll("[data-auth-view]").forEach(b=>b.addEventListener("click",()=>{state.authView=b.dataset.authView;render()}));app.querySelectorAll("form[data-auth-form]").forEach(f=>f.addEventListener("submit",e=>submitAuth(e,f.dataset.authForm)))}
  function submitAuth(e,type){e.preventDefault();const f=e.currentTarget,v=Object.fromEntries(new FormData(f).entries());if(type==="login"){const email=String(v.email||"").trim().toLowerCase();const saved=JSON.parse(localStorage.getItem("motocare_staff_account")||"null");const validDemo=email==="admin@motocare.ai"&&v.password==="admin123";const validSaved=saved&&email===String(saved.email).toLowerCase()&&v.password===saved.password;if(!validDemo&&!validSaved){toast("Invalid email or password.");return}if(saved){state.account={name:saved.name,email:saved.email,role:saved.role};}state.authenticated=true;localStorage.setItem("motocare_staff_session","1");render();toast("Welcome back to MotoCare AI.")}else if(type==="signup"){if(v.password!==v.confirm){toast("Passwords do not match.");return}if(String(v.password||"").length<6){toast("Password must be at least 6 characters.");return}state.account={name:v.name,email:v.email,role:"Staff"};localStorage.setItem("motocare_staff_account",JSON.stringify({...state.account,password:v.password}));state.authenticated=true;localStorage.setItem("motocare_staff_session","1");render();toast("Staff account created.")}else if(type==="forgot"){state.authView="login";render();toast("Password reset link simulated.")}}
  function bind(){
    app.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.nav)));
    app.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",handleAction));
    const search=app.querySelector("#search"); if(search){search.addEventListener("input",e=>{state.search=e.target.value;render()})}
    const filter=app.querySelector("#filter"); if(filter){filter.value=state.page==="customers"?state.customerFilter:state.page==="inventory"?state.inventoryFilter:state.statusFilter;filter.addEventListener("change",e=>{if(state.page==="customers")state.customerFilter=e.target.value;else if(state.page==="inventory")state.inventoryFilter=e.target.value;else state.statusFilter=e.target.value;render()})}
    app.querySelectorAll("form[data-form]").forEach(f=>f.addEventListener("submit",e=>submitForm(e,f.dataset.form)));
    const posSearch=app.querySelector("#posSearch"); if(posSearch)posSearch.addEventListener("input",()=>{const q=posSearch.value.toLowerCase();app.querySelector("#productGrid").innerHTML=data.products.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<button class="product" type="button" data-action="add-cart" data-id="${p.id}"><div class="product-name">${esc(p.name)}</div><div class="product-meta">${p.category}</div><div class="product-price">${money(p.price)}</div></button>`).join("");bind();});
  }

  function navigate(page){state.page=page;state.search="";state.showProfileMenu=false;state.notificationsOpen=false;state.modal=null;state.report=null;state.selectedCustomer=null;state.selectedMotorcycle=null;state.selectedAppointment=null;state.selectedRepair=null;state.selectedMechanic=null;state.selectedItem=null;render();window.scrollTo(0,0)}
  function render(){
    let content="";
    if(state.page==="dashboard")content=dashboard();
    else if(state.page==="customers")content=customers();
    else if(state.page==="customer-detail")content=customerDetail();
    else if(state.page==="motorcycles")content=motorcycles();
    else if(state.page==="motorcycle-detail")content=motorcycleDetail();
    else if(state.page==="appointments")content=appointments();
    else if(state.page==="appointment-calendar")content=calendar();
    else if(state.page==="repairs")content=repairs();
    else if(state.page==="repair-detail")content=repairDetail();
    else if(state.page==="mechanics")content=mechanics();
    else if(state.page==="mechanic-detail")content=mechanicDetail();
    else if(state.page==="inventory")content=inventory();
    else if(state.page==="item-detail")content=itemDetail();
    else if(state.page==="pos")content=pos();
    else if(state.page==="reports")content=reports();
    else if(state.page==="report-detail")content=reportPage();
    else if(state.page==="account")content=accountPage();
    else content=dashboard();
    shell(content);
  }

  function handleAction(e){
    const a=e.currentTarget.dataset.action,id=e.currentTarget.dataset.id;
    if(a==="go")navigate(e.currentTarget.dataset.page);
    if(a==="menu")app.querySelector("#sidebar")?.classList.toggle("open");
    if(a==="notification"){state.notificationsOpen=!state.notificationsOpen;state.showProfileMenu=false;render()}
    if(a==="profile-menu"){state.showProfileMenu=!state.showProfileMenu;state.notificationsOpen=false;render()}
    if(a==="logout"){state.authenticated=false;state.authView="login";state.showProfileMenu=false;localStorage.removeItem("motocare_staff_session");render()}
    if(a==="account-settings"){state.page="account";state.showProfileMenu=false;render()}
    if(a==="change-password"){state.showProfileMenu=false;openModal("password")}
    if(a==="edit-account"){openModal("account")}
    if(a==="mark-notifications"){state.notifications.forEach(n=>n.read=true);render()}
    if(a==="read-notification"){const n=state.notifications.find(x=>x.id===Number(id));if(n)n.read=true;render()}
    if(a==="customer-detail"){state.selectedCustomer=id;state.page="customer-detail";render()}
    if(a==="motorcycle-detail"){state.selectedMotorcycle=id;state.page="motorcycle-detail";render()}
    if(a==="appointment-detail"){state.selectedAppointment=id;openModal("appointment",{edit:data.appointments.find(x=>x.id===id)})}
    if(a==="repair-detail"){state.selectedRepair=id;state.page="repair-detail";render()}
    if(a==="mechanic-detail"){state.selectedMechanic=id;state.page="mechanic-detail";render()}
    if(a==="item-detail"){state.selectedItem=id;state.page="item-detail";render()}
    if(a==="open-add")openModal(e.currentTarget.dataset.type,{owner:e.currentTarget.dataset.owner});
    if(a==="open-edit"){const type=e.currentTarget.dataset.type;const maps={customer:data.customers,motorcycle:data.motorcycles,mechanic:data.mechanics,inventory:data.inventory};openModal(type,{edit:maps[type].find(x=>x.id===id)})}
    if(a==="close-modal")closeModal();
    if(a==="payment")openModal("payment");
    if(a==="clear-cart"){state.cart=[];render();toast("Sale cleared.")}
    if(a==="add-cart"){const p=data.products.find(x=>x.id===id);const existing=state.cart.find(x=>x.id===id);if(existing)existing.qty++;else state.cart.push({...p,qty:1});render();toast(`${p.name} added to sale.`)}
    if(a==="qty"){const item=state.cart.find(x=>x.id===id);if(item){item.qty+=Number(e.currentTarget.dataset.delta);if(item.qty<=0)state.cart=state.cart.filter(x=>x!==item)}render()}
    if(a==="stock"){state.modal={type:"stock",itemId:id};render()}
    if(a==="add-part"){state.modal={type:"part",repairId:id};render()}
    if(a==="assign-mechanic"){state.modal={type:"assign",repairId:id};render()}
    if(a==="repair-status"){state.modal={type:"status",repairId:id};render()}
    if(a==="report"){state.report=e.currentTarget.dataset.report;state.page="report-detail";render()}
    if(a==="report-export"){toast("Prototype only: report export is simulated.");}
  }

  function openModal(type,opts={}){state.modal={type,...opts};render()}
  function closeModal(){state.modal=null;render()}

  function submitForm(e,type){
    e.preventDefault();
    const f=e.currentTarget, fd=new FormData(f), v=Object.fromEntries(fd.entries());
    if(type==="customer"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,v);else data.customers.unshift({id:"CUS-"+String(Date.now()).slice(-4),...v,motorcycles:0});
      closeModal();toast("Customer saved.");
    } else if(type==="motorcycle"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,v);else data.motorcycles.unshift({id:"MOT-"+String(Date.now()).slice(-4),...v,lastService:"Not yet serviced",nextService:"To be scheduled"});
      closeModal();toast("Motorcycle saved.");
    } else if(type==="appointment"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,v);else data.appointments.push({id:"APT-"+String(Date.now()).slice(-4),...v,status:"Pending"});
      closeModal();toast("Appointment saved.");
    } else if(type==="repair"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,v);else data.repairs.unshift({id:"REP-"+String(Date.now()).slice(-4),...v,status:"Received",estimate:Number(v.estimate||0),parts:[]});
      closeModal();toast("Repair saved.");
    } else if(type==="mechanic"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,v);else data.mechanics.push({id:"MECH-"+String(Date.now()).slice(-4),...v,activeJobs:0,completed:0});
      closeModal();toast("Mechanic saved.");
    } else if(type==="inventory"){
      const edit=state.modal.edit;
      if(edit)Object.assign(edit,{...v,stock:Number(v.stock),reorder:Number(v.reorder),price:Number(v.price)});else data.inventory.push({id:"INV-"+String(Date.now()).slice(-4),...v,stock:Number(v.stock),reorder:Number(v.reorder),price:Number(v.price)});
      closeModal();toast("Inventory item saved.");
    } else if(type==="payment"){
      const total=state.cart.reduce((s,x)=>s+x.price*x.qty,0), received=Number(v.received||0);
      if(received<total){toast("Amount received is less than the total.");return}
      state.modal=null;state.page="reports";render();toast(`Payment completed. Change: ${money(received-total)}`);
    } else if(type==="stock"){
      const i=data.inventory.find(x=>x.id===state.modal.itemId);const qty=Number(v.quantity||0);
      if(i){i.stock=Math.max(0,i.stock+qty);closeModal();toast("Stock updated.");}
    } else if(type==="part"){
      const r=data.repairs.find(x=>x.id===state.modal.repairId);if(r){r.parts.push(v.part);closeModal();toast("Part added to repair.");}
    } else if(type==="assign"){
      const r=data.repairs.find(x=>x.id===state.modal.repairId);if(r){r.mechanic=v.mechanic;closeModal();toast("Mechanic assigned.");}
    } else if(type==="status"){
      const r=data.repairs.find(x=>x.id===state.modal.repairId);if(r){r.status=v.status;closeModal();toast("Repair status updated.");}
    } else if(type==="account"){
      state.account.name=v.name;state.account.email=v.email;localStorage.setItem("motocare_staff_account",JSON.stringify(state.account));closeModal();toast("Profile updated.");
    } else if(type==="password"){
      if(v.password!==v.confirm){toast("New passwords do not match.");return}
      if(String(v.password||"").length<6){toast("Password must be at least 6 characters.");return}
      closeModal();toast("Password changed successfully.");
    }
  }

  function toast(msg){const el=app.querySelector("#toast");if(!el)return;el.textContent=msg;el.classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>el.classList.remove("show"),2200)}
  render();
})();
