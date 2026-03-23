(function () {
  const pageTitle = document.getElementById("page-title");
  const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
  const sideNavButtons = Array.from(document.querySelectorAll(".side-nav-btn"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  const openSideMenuBtn = document.getElementById("open-side-menu");
  const closeSideMenuBtn = document.getElementById("close-side-menu");
  const sideMenu = document.getElementById("side-menu");
  const menuMask = document.getElementById("menu-mask");
  const exportBackupBtn = document.getElementById("export-backup-btn");
  const importBackupFileInput = document.getElementById("import-backup-file");
  const preorderList = document.getElementById("preorder-list");
  const fulfillmentList = document.getElementById("fulfillment-list");
  const statsWrap = document.getElementById("stats-table-wrap");
  const statsStart = document.getElementById("stats-start");
  const statsEnd = document.getElementById("stats-end");
  const sumCost = document.getElementById("sum-cost");
  const sumIncome = document.getElementById("sum-income");
  const sumProfit = document.getElementById("sum-profit");
  const modeButtons = Array.from(document.querySelectorAll(".seg-btn"));

  const preorderModal = document.getElementById("preorder-modal");
  const preorderSearchInput = document.getElementById("preorder-search");
  const preorderSearchToggle = document.getElementById("preorder-search-toggle");
  const preorderModalTitle = document.getElementById("preorder-modal-title");
  const preorderEditId = document.getElementById("preorder-edit-id");
  const openPreorderModalBtn = document.getElementById("open-preorder-modal");
  const closePreorderModalBtn = document.getElementById("close-preorder-modal");
  const preorderForm = document.getElementById("preorder-form");
  const preorderCategoryInput = document.getElementById("preorder-category");
  const preorderCustomerInput = document.getElementById("preorder-customer");
  const preorderProductInput = document.getElementById("preorder-product");
  const preorderQtyInput = document.getElementById("preorder-quantity");
  const preorderCostPriceInput = document.getElementById("preorder-cost-price");
  const preorderSalePriceInput = document.getElementById("preorder-sale-price");
  const preorderNoteInput = document.getElementById("preorder-note");
  const categorySuggestions = document.getElementById("category-suggestions");
  const customerSuggestions = document.getElementById("customer-suggestions");
  const productSuggestions = document.getElementById("product-suggestions");

  const preorderLockedInfo = document.getElementById("preorder-locked-info");
  const preorderSubmitBtn = document.getElementById("preorder-submit-btn");
  const preorderDoneBtn = document.getElementById("preorder-done-btn");
  const preorderBatchActions = document.getElementById("preorder-batch-actions");
  const preorderContinueActions = document.getElementById("preorder-continue-actions");
  const saveNextCustomerBtn = document.getElementById("save-next-customer");
  const saveNextProductBtn = document.getElementById("save-next-product");
  const preorderFieldCategory = document.getElementById("preorder-field-category");
  const preorderFieldCustomer = document.getElementById("preorder-field-customer");
  const preorderFieldProduct = document.getElementById("preorder-field-product");
  const preorderFieldPrices = document.getElementById("preorder-field-prices");

  const fulfillmentFilter = document.getElementById("fulfillment-filter");
  const runStatsBtn = document.getElementById("run-stats");

  const productForm = document.getElementById("product-form");
  const productModal = document.getElementById("product-modal");
  const batchModal = document.getElementById("batch-modal");
  const openProductModalBtn = document.getElementById("open-product-modal");
  const closeProductModalBtn = document.getElementById("close-product-modal");
  const productIdInput = document.getElementById("product-id");
  const productNameInput = document.getElementById("product-name");
  const productCategorySelect = document.getElementById("product-category");
  const productStockInput = document.getElementById("product-stock");
  const productCostInput = document.getElementById("product-cost");
  const productSaleInput = document.getElementById("product-sale");
  const productResetBtn = document.getElementById("product-reset");
  const productList = document.getElementById("product-list");
  const productSearchForm = document.getElementById("product-search-form");
  const productSearchInput = document.getElementById("product-search");
  const batchForm = document.getElementById("batch-form");
  const batchTitle = document.getElementById("batch-title");
  const batchProductIdInput = document.getElementById("batch-product-id");
  const batchNameInput = document.getElementById("batch-name");
  const batchStockDeltaInput = document.getElementById("batch-stock-delta");
  const batchCostPriceInput = document.getElementById("batch-cost-price");
  const batchSalePriceInput = document.getElementById("batch-sale-price");
  const closeBatchModalBtn = document.getElementById("close-batch-modal");

  const customerForm = document.getElementById("customer-form");
  const customerNameInput = document.getElementById("customer-name");
  const customerList = document.getElementById("customer-list");

  const categoryForm = document.getElementById("category-form");
  const categoryNameInput = document.getElementById("category-name");
  const categoryList = document.getElementById("category-list");
  const toastEl = document.getElementById("toast");
  const confirmModal = document.getElementById("confirm-modal");
  const confirmMessage = document.getElementById("confirm-message");
  const confirmInput = document.getElementById("confirm-input");
  const confirmOkBtn = document.getElementById("confirm-ok");
  const confirmCancelBtn = document.getElementById("confirm-cancel");
  const billingModal = document.getElementById("billing-modal");
  const billingForm = document.getElementById("billing-form");
  const billingTitle = document.getElementById("billing-title");
  const billingRows = document.getElementById("billing-rows");
  const billingShippingFee = document.getElementById("billing-shipping-fee");
  const billingTotalCost = document.getElementById("billing-total-cost");
  const billingTotalSale = document.getElementById("billing-total-sale");
  const billingTotalProfit = document.getElementById("billing-total-profit");
  const generateBillingBtn = document.getElementById("generate-billing");
  const closeBillingModalBtn = document.getElementById("close-billing-modal");
  const billingPreview = document.getElementById("billing-preview");
  const reportModal = document.getElementById("report-modal");
  const closeReportModalBtn = document.getElementById("close-report-modal");
  const reportTitle = document.getElementById("report-title");
  const reportTotalSale = document.getElementById("report-total-sale");
  const reportTotalCost = document.getElementById("report-total-cost");
  const reportTotalProfit = document.getElementById("report-total-profit");
  const reportRows = document.getElementById("report-rows");
  const reportBackBtn = document.getElementById("report-back-btn");

  const state = {
    activeTab: "preorders",
    preorderViewMode: localStorage.getItem("preorder-view-mode") || "category",
    addMode: "single",
    billingDraft: null,
    uiLock: false,
    fulfillmentOpenState: JSON.parse(localStorage.getItem("fulfillment-open-state") || "{}"),
    categoryOpenState: JSON.parse(localStorage.getItem("category-open-state") || "{}")
  };
  const TAB_TITLES = {
    preorders: "预购清单",
    fulfillments: "收款发货",
    stats: "记录统计",
    products: "商品库",
    customers: "客户管理",
    categories: "分类管理"
  };
  let toastTimer = null;

  function formatMoney(value) {
    return Number(value || 0).toFixed(2);
  }

  function numberOrZero(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleDateString("zh-CN");
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, duration) {
    if (!toastEl) {
      window.alert(message);
      return;
    }
    var text = String(message || "");
    toastEl.textContent = text;
    toastEl.classList.remove("toast-error");
    var isError = /失败|不能|不存在|已被|无法|错误|不正确/.test(text);
    if (isError) {
      toastEl.classList.add("toast-error");
    }
    toastEl.classList.add("show");
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    var ms = duration || (isError ? 4000 : 3000);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show", "toast-error");
    }, ms);
  }

  function customConfirm(message) {
    return new Promise((resolve) => {
      confirmMessage.textContent = message;
      confirmInput.style.display = "none";
      confirmInput.value = "";
      confirmOkBtn.textContent = "确定";
      var onOk = () => { cleanup(); confirmModal.close(); resolve(true); };
      var onCancel = () => { cleanup(); confirmModal.close(); resolve(false); };
      function cleanup() {
        confirmOkBtn.removeEventListener("click", onOk);
        confirmCancelBtn.removeEventListener("click", onCancel);
      }
      confirmOkBtn.addEventListener("click", onOk);
      confirmCancelBtn.addEventListener("click", onCancel);
      confirmModal.showModal();
    });
  }

  function customPrompt(message, defaultValue) {
    return new Promise((resolve) => {
      confirmMessage.textContent = message;
      confirmInput.style.display = "";
      confirmInput.value = defaultValue || "";
      confirmOkBtn.textContent = "保存";
      var onOk = () => { cleanup(); confirmModal.close(); resolve(confirmInput.value.trim() || null); };
      var onCancel = () => { cleanup(); confirmModal.close(); resolve(null); };
      function cleanup() {
        confirmOkBtn.removeEventListener("click", onOk);
        confirmCancelBtn.removeEventListener("click", onCancel);
      }
      confirmOkBtn.addEventListener("click", onOk);
      confirmCancelBtn.addEventListener("click", onCancel);
      confirmModal.showModal();
      confirmInput.focus();
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
    sideNavButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === "tab-" + tab));
    pageTitle.textContent = TAB_TITLES[tab] || "代购记账";
    openPreorderModalBtn.style.display = tab === "preorders" ? "inline-flex" : "none";
  }

  function openSideMenu() {
    sideMenu.classList.add("open");
    menuMask.classList.add("open");
    document.body.classList.add("menu-open");
  }

  function makeBackupFilename() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return "daigou-backup-" + y + m + d + "-" + hh + mm + ".json";
  }

  function applyUiLockMode() {
    document.body.classList.toggle("ui-lock", state.uiLock);
  }

  function getOpenState(stateMap, key, defaultOpen) {
    if (Object.prototype.hasOwnProperty.call(stateMap, key)) {
      return !!stateMap[key];
    }
    return defaultOpen;
  }

  function setOpenState(type, key, value) {
    if (!key) {
      return;
    }
    if (type === "fulfillment") {
      state.fulfillmentOpenState[key] = !!value;
      localStorage.setItem("fulfillment-open-state", JSON.stringify(state.fulfillmentOpenState));
      return;
    }
    if (type === "category") {
      state.categoryOpenState[key] = !!value;
      localStorage.setItem("category-open-state", JSON.stringify(state.categoryOpenState));
    }
  }

  function closeSideMenu() {
    sideMenu.classList.remove("open");
    menuMask.classList.remove("open");
    document.body.classList.remove("menu-open");
  }

  function groupBy(records, getKey) {
    const map = new Map();
    records.forEach((item) => {
      const key = getKey(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    return map;
  }

  function fillDatalist(element, names) {
    element.innerHTML = names.map((name) => "<option value=\"" + escapeHTML(name) + "\"></option>").join("");
  }

  async function onSuggest(inputEl, searchMethod, targetList) {
    const names = await searchMethod(inputEl.value.trim());
    fillDatalist(targetList, names);
  }

  async function renderPreorders() {
    const { records } = await window.DB.getAllJoined();
    const activeRecords = records.filter((item) => !item.preorder.isBought);
    const keyword = String(preorderSearchInput.value || "").trim().toLowerCase();
    const filtered = keyword
      ? activeRecords.filter((item) => {
          const customerName = (item.customer && item.customer.name) || "";
          const productName = (item.product && item.product.name) || "";
          const note = item.preorder.note || "";
          return (
            customerName.toLowerCase().includes(keyword) ||
            productName.toLowerCase().includes(keyword) ||
            note.toLowerCase().includes(keyword)
          );
        })
      : activeRecords;
    if (!filtered.length) {
      preorderList.className = "card-list empty-tip";
      preorderList.textContent = keyword ? "未找到匹配的订单。" : "暂无预购订单，点击右下角加号开始添加。";
      return;
    }

    preorderList.className = "card-list";
    const grouped = groupBy(filtered, (item) => {
      if (state.preorderViewMode === "customer") {
        return (item.customer && item.customer.name) || "未命名客户";
      }
      return (item.category && item.category.name) || "未分类";
    });

    function renderPreorderItem(item) {
      const isCustomerMode = state.preorderViewMode === "customer";
      return (
        "<div class=\"swipe-row\" data-swipe-dir=\"left\" data-preorder-id=\"" + escapeHTML(item.preorder.id) + "\">" +
        "<div class=\"swipe-content\">" +
        "<div class=\"item-card\" data-preorder-id=\"" + escapeHTML(item.preorder.id) + "\">" +
        (isCustomerMode
          ? "<div class=\"line\"><strong>" +
            escapeHTML((item.product && item.product.name) || "未知商品") +
            "</strong><span>×" +
            escapeHTML(item.preorder.quantity) +
            "</span></div>"
          : "<div class=\"item-sub-line\">" +
            "<span>客户：" + escapeHTML((item.customer && item.customer.name) || "未知客户") + "</span>" +
            "<span>×" + escapeHTML(item.preorder.quantity) + "</span>" +
            "</div>") +
        (item.preorder.note
          ? "<div class=\"item-meta\">备注：" + escapeHTML(item.preorder.note) + "</div>"
          : "") +
        "<div class=\"item-meta\">进价：" +
        formatMoney(item.preorder.costPrice) +
        " | 售价：" +
        formatMoney(item.preorder.salePrice) +
        "</div>" +
        "<div class=\"item-actions\">" +
        "<button class=\"action-btn ghost-btn js-edit-preorder\" " +
        "data-id=\"" + escapeHTML(item.preorder.id) + "\">编辑</button>" +
        "<button class=\"action-btn ghost-btn status-bought js-toggle-bought\" " +
        "data-id=\"" + escapeHTML(item.preorder.id) + "\">买到</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class=\"swipe-action swipe-action-right js-delete-preorder\" data-id=\"" + escapeHTML(item.preorder.id) + "\">删除</div>" +
        "</div>"
      );
    }

    const html = Array.from(grouped.entries())
      .map(([groupName, items]) => {
        let linesHTML = "";
        if (state.preorderViewMode !== "customer") {
          const subGrouped = groupBy(items, (item) =>
            (item.product && item.product.name) || "未知商品"
          );
          linesHTML = Array.from(subGrouped.entries())
            .map(([productName, subItems]) => {
              const totalQty = subItems.reduce((s, i) => s + (Number(i.preorder.quantity) || 0), 0);
              const subLines = subItems.map(renderPreorderItem).join("");
              return (
                "<div class=\"product-subgroup\">" +
                "<div class=\"product-subgroup-title\">" +
                escapeHTML(productName) +
                " <span class=\"product-subgroup-qty\">共 " + totalQty + " 件</span>" +
                "</div>" +
                subLines +
                "</div>"
              );
            })
            .join("");
        } else {
          linesHTML = items.map(renderPreorderItem).join("");
        }
        return (
          "<div class=\"group-card\"><h3 class=\"group-title\">" +
          escapeHTML(groupName) +
          "</h3>" +
          linesHTML +
          "</div>"
        );
      })
      .join("");

    preorderList.innerHTML = html;
  }

  async function renderFulfillments() {
    const filter = fulfillmentFilter.value;
    const { records } = await window.DB.getAllJoined();
    let list = records.filter((item) => item.fulfillment);
    if (filter === "pending") {
      list = list.filter((item) => !(item.fulfillment.isPaid && item.fulfillment.isShipped));
    }
    if (filter === "done") {
      list = list.filter((item) => item.fulfillment.isPaid && item.fulfillment.isShipped);
    }
    if (!list.length) {
      fulfillmentList.className = "card-list empty-tip";
      fulfillmentList.textContent = "暂无收款发货记录。";
      return;
    }
    fulfillmentList.className = "card-list";
    const grouped = groupBy(
      list,
      (item) => (item.customer && item.customer.id) || ((item.customer && item.customer.name) || "未知客户")
    );
    const html = Array.from(grouped.entries())
      .map(([groupKey, items]) => {
        const customerName = (items[0].customer && items[0].customer.name) || "未知客户";
        const isOpen = getOpenState(state.fulfillmentOpenState, groupKey, true);
        items.sort((a, b) => {
          const aDone = a.fulfillment.isPaid && a.fulfillment.isShipped ? 1 : 0;
          const bDone = b.fulfillment.isPaid && b.fulfillment.isShipped ? 1 : 0;
          return aDone - bDone;
        });
        const rows = items
          .map((item) => {
            const isCompleted = item.fulfillment.isPaid && item.fulfillment.isShipped;
            const noteHtml = item.preorder.note
              ? "<div class=\"fulfillment-note\">" + escapeHTML(item.preorder.note) + "</div>"
              : "";
            return (
              "<div class=\"swipe-row" + (isCompleted ? " is-completed" : "") + "\" data-swipe-dir=\"left\" data-fulfillment-id=\"" + escapeHTML(item.fulfillment.id) + "\">" +
              "<div class=\"swipe-content\">" +
              "<table class=\"fulfillment-table\"><tbody><tr>" +
              "<td class=\"fulfillment-product-name\">" +
              escapeHTML((item.product && item.product.name) || "未知商品") +
              noteHtml +
              "</td>" +
              "<td>" +
              escapeHTML(item.preorder.quantity) +
              "</td>" +
              "<td><button class=\"ghost-btn mini-btn js-toggle-paid " +
              (item.fulfillment.isPaid ? "status-paid" : "status-unpaid") +
              "\" data-id=\"" +
              escapeHTML(item.fulfillment.id) +
              "\" data-next=\"" +
              (item.fulfillment.isPaid ? "0" : "1") +
              "\">" +
              (item.fulfillment.isPaid ? "已付" : "未付") +
              "</button></td>" +
              "<td><button class=\"ghost-btn mini-btn js-toggle-shipped " +
              (item.fulfillment.isShipped ? "status-shipped" : "status-unshipped") +
              "\" data-id=\"" +
              escapeHTML(item.fulfillment.id) +
              "\" data-next=\"" +
              (item.fulfillment.isShipped ? "0" : "1") +
              "\">" +
              (item.fulfillment.isShipped ? "已发" : "未发") +
              "</button></td>" +
              "</tr></tbody></table>" +
              "</div>" +
              "<div class=\"swipe-action swipe-action-right js-delete-fulfillment\" data-id=\"" + escapeHTML(item.fulfillment.id) + "\">删除</div>" +
              "</div>"
            );
          })
          .join("");
        return (
          "<details class=\"fulfillment-customer-card\" data-group=\"" +
          escapeHTML(groupKey) +
          "\" " +
          (isOpen ? "open" : "") +
          "><summary>" +
          "<span>" +
          escapeHTML(customerName) +
          "（" +
          items.length +
          "）</span>" +
          "<button class=\"primary-btn mini-btn js-open-billing\" data-customer=\"" +
          escapeHTML(items[0].customer && items[0].customer.id) +
          "\" data-name=\"" +
          escapeHTML(customerName) +
          "\">收款</button>" +
          "</summary>" +
          "<div class=\"fulfillment-table-header\"><table class=\"fulfillment-table\"><thead><tr><th>商品</th><th>数量</th><th>已付</th><th>已发</th></tr></thead></table></div>" +
          "<div class=\"swipe-list\">" +
          rows +
          "</div></details>"
        );
      })
      .join("");
    fulfillmentList.innerHTML = html;
  }

  function renderBillingRows() {
    if (!state.billingDraft) {
      billingRows.innerHTML = "";
      return;
    }
    billingRows.innerHTML = state.billingDraft.rows
      .map((row) => {
        return (
          "<tr>" +
          "<td class=\"fulfillment-product-name\">" +
          escapeHTML(row.productName) +
          "</td>" +
          "<td><input class=\"billing-input js-billing-qty\" data-id=\"" +
          escapeHTML(row.preorderId) +
          "\" type=\"number\" min=\"1\" step=\"1\" value=\"" +
          escapeHTML(row.quantity) +
          "\" /></td>" +
          "<td><input class=\"billing-input js-billing-cost\" data-id=\"" +
          escapeHTML(row.preorderId) +
          "\" type=\"number\" min=\"0\" step=\"0.01\" value=\"" +
          escapeHTML(row.costPrice) +
          "\" /></td>" +
          "<td><input class=\"billing-input js-billing-sale\" data-id=\"" +
          escapeHTML(row.preorderId) +
          "\" type=\"number\" min=\"0\" step=\"0.01\" value=\"" +
          escapeHTML(row.salePrice) +
          "\" /></td>" +
          "<td><input class=\"billing-input js-billing-deposit\" data-id=\"" +
          escapeHTML(row.preorderId) +
          "\" type=\"number\" min=\"0\" step=\"0.01\" value=\"" +
          escapeHTML(row.deposit) +
          "\" /></td>" +
          "<td><label><input class=\"js-billing-paid\" data-id=\"" +
          escapeHTML(row.preorderId) +
          "\" type=\"checkbox\" " +
          (row.isPaid ? "checked" : "") +
          " />已付</label></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function recalcBillingTotals() {
    if (!state.billingDraft) {
      return;
    }
    const shipping = numberOrZero(billingShippingFee.value);
    let totalSale = 0;
    state.billingDraft.rows.forEach((row) => {
      totalSale += numberOrZero(row.quantity) * numberOrZero(row.salePrice) + numberOrZero(row.deposit);
    });
    totalSale += shipping;
    billingTotalSale.textContent = formatMoney(totalSale);
    const paid = numberOrZero(billingTotalCost.value);
    billingTotalProfit.textContent = formatMoney(totalSale - paid);
  }

  function renderBillPreview() {
    if (!state.billingDraft) {
      billingPreview.innerHTML = "";
      return;
    }
    const shipping = numberOrZero(billingShippingFee.value);
    const rowsHtml = state.billingDraft.rows
      .map((row) => {
        const rowSale = numberOrZero(row.quantity) * numberOrZero(row.salePrice) + numberOrZero(row.deposit);
        return (
          "<li><span>" +
          escapeHTML(row.productName) +
          " ×" +
          escapeHTML(row.quantity) +
          "</span><strong>￥" +
          formatMoney(rowSale) +
          "</strong></li>"
        );
      })
      .join("");
    billingPreview.innerHTML =
      "<div class=\"bill-card\"><h4>" +
      escapeHTML(state.billingDraft.customerName) +
      " 的账单</h4><ul>" +
      rowsHtml +
      "</ul><div class=\"bill-extra\">邮费：￥" +
      formatMoney(shipping) +
      "</div><div class=\"bill-total\">总计：￥" +
      billingTotalSale.textContent +
      "</div><div class=\"bill-extra\">已付：￥" +
      formatMoney(numberOrZero(billingTotalCost.value)) +
      "</div><div class=\"bill-total\">待付：￥" +
      billingTotalProfit.textContent +
      "</div></div>";
  }

  function renderReportPage() {
    if (!state.billingDraft) {
      return;
    }
    reportTitle.textContent = state.billingDraft.customerName + " 的账单";
    reportTotalSale.textContent = billingTotalSale.textContent;
    reportTotalCost.textContent = formatMoney(numberOrZero(billingTotalCost.value));
    reportTotalProfit.textContent = billingTotalProfit.textContent;
    reportRows.innerHTML = state.billingDraft.rows
      .map((row) => {
        return (
          "<tr>" +
          "<td class=\"fulfillment-product-name\">" +
          escapeHTML(row.productName) +
          "</td>" +
          "<td>" +
          escapeHTML(row.quantity) +
          "</td>" +
          "<td>" +
          formatMoney(row.salePrice) +
          "</td>" +
          "<td>" +
          formatMoney(row.deposit) +
          "</td>" +
          "<td>" +
          (row.isPaid ? "已付" : "未付") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    reportModal.showModal();
  }

  async function openBillingModal(customerId, customerName) {
    const { records } = await window.DB.getAllJoined();
    const targetRows = records
      .filter((item) => item.customer && item.customer.id === customerId && item.fulfillment)
      .map((item) => ({
        preorderId: item.preorder.id,
        fulfillmentId: item.fulfillment.id,
        productName: (item.product && item.product.name) || "未知商品",
        quantity: Number(item.preorder.quantity) || 1,
        costPrice: numberOrZero(item.preorder.costPrice || (item.product && item.product.costPrice)),
        salePrice: numberOrZero(item.preorder.salePrice || (item.product && item.product.salePrice)),
        deposit: numberOrZero(item.preorder.deposit),
        isPaid: !!item.fulfillment.isPaid
      }));

    state.billingDraft = {
      customerId,
      customerName,
      rows: targetRows
    };
    billingTitle.textContent = customerName + " 的账单生成";
    billingShippingFee.value = "0";
    billingTotalCost.value = "0";
    renderBillingRows();
    recalcBillingTotals();
    renderBillPreview();
    billingModal.showModal();
  }

  async function renderStats() {
    const keepPageY = state.activeTab === "stats" ? window.scrollY : 0;
    const keepInnerY = statsWrap ? statsWrap.scrollTop : 0;
    const rows = await window.DB.getCompletedStats(statsStart.value, statsEnd.value);
    if (!rows.length) {
      statsWrap.innerHTML = "<div class=\"empty-tip stats-empty\">当前区间暂无已完成交易。</div>";
      sumCost.textContent = "0.00";
      sumIncome.textContent = "0.00";
      sumProfit.textContent = "0.00";
      if (state.activeTab === "stats") {
        window.scrollTo(0, keepPageY);
        statsWrap.scrollTop = keepInnerY;
      }
      return;
    }
    let totalCost = 0;
    let totalIncome = 0;
    const tr = rows
      .map((row) => {
        totalCost += row.totalCost;
        totalIncome += row.totalIncome;
        return (
          "<tr>" +
          "<td>" +
          escapeHTML(row.customerName) +
          "</td>" +
          "<td>" +
          escapeHTML(row.productName) +
          "</td>" +
          "<td>" +
          escapeHTML(row.quantity) +
          "</td>" +
          "<td>" +
          formatMoney(row.costPrice) +
          "</td>" +
          "<td>" +
          formatMoney(row.salePrice) +
          "</td>" +
          "<td>" +
          formatMoney(row.totalCost) +
          "</td>" +
          "<td>" +
          formatMoney(row.totalIncome) +
          "</td>" +
          "<td>" +
          escapeHTML(formatDate(row.completedAt)) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    statsWrap.innerHTML =
      "<table class=\"stats-table\"><thead><tr><th>买家</th><th>商品</th><th>数量</th><th>进价</th><th>售价</th><th>成本</th><th>收入</th><th>完成日期</th></tr></thead><tbody>" +
      tr +
      "</tbody></table>";
    sumCost.textContent = formatMoney(totalCost);
    sumIncome.textContent = formatMoney(totalIncome);
    sumProfit.textContent = formatMoney(totalIncome - totalCost);
    if (state.activeTab === "stats") {
      window.scrollTo(0, keepPageY);
      statsWrap.scrollTop = keepInnerY;
    }
  }

  async function renderProductCategoryOptions() {
    const categories = await window.DB.listCategories();
    const options = ["<option value=\"\">未分类</option>"]
      .concat(
        categories
          .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"))
          .map((item) => "<option value=\"" + escapeHTML(item.id) + "\">" + escapeHTML(item.name) + "</option>")
      )
      .join("");
    productCategorySelect.innerHTML = options;
  }

  function resetProductForm() {
    productIdInput.value = "";
    productNameInput.value = "";
    productCategorySelect.value = "";
    productStockInput.value = "0";
    productCostInput.value = "0";
    productSaleInput.value = "0";
  }

  function openProductModal() {
    productModal.showModal();
  }

  async function renderProducts() {
    const [products, categories, batches] = await Promise.all([
      window.DB.listProducts(),
      window.DB.listCategories(),
      window.DB.listProductBatches()
    ]);
    const categoryMap = new Map(categories.map((item) => [item.id, item.name]));
    const batchByProduct = new Map();
    batches.forEach((batch) => {
      if (!batchByProduct.has(batch.productId)) {
        batchByProduct.set(batch.productId, []);
      }
      batchByProduct.get(batch.productId).push(batch);
    });
    if (!products.length) {
      productList.className = "card-list empty-tip";
      productList.textContent = "暂无商品。";
      return;
    }
    productList.className = "card-list";
    const keyword = String((productSearchInput && productSearchInput.value) || "")
      .trim()
      .toLowerCase();
    const filtered = products.filter((item) => {
      if (!keyword) {
        return true;
      }
      return String(item.name || "")
        .toLowerCase()
        .includes(keyword);
    });
    if (!filtered.length) {
      productList.className = "card-list empty-tip";
      productList.textContent = keyword ? "未找到匹配的商品。" : "暂无商品。";
      return;
    }

    productList.innerHTML = filtered
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => {
        const categoryName = categoryMap.get(item.categoryId) || "未分类";
        const batchText = (batchByProduct.get(item.id) || [])
          .sort((a, b) => b.batchName.localeCompare(a.batchName))
          .map((batch) => batch.batchName + "(库存" + batch.stock + ")")
          .join("，");
        return (
          "<div class=\"item-card\">" +
          "<div class=\"line\"><strong>" +
          escapeHTML(item.name) +
          "</strong><small>" +
          escapeHTML(categoryName) +
          "</small></div>" +
          "<div class=\"item-meta\">库存：" +
          escapeHTML(item.stock) +
          " | 进价：" +
          formatMoney(item.costPrice) +
          " | 售价：" +
          formatMoney(item.salePrice) +
          "</div>" +
          "<div class=\"item-meta\">批次：" +
          escapeHTML(batchText || "暂无批次") +
          "</div>" +
          "<div class=\"row-actions\">" +
          "<button class=\"ghost-btn js-add-batch\" data-id=\"" +
          escapeHTML(item.id) +
          "\" data-name=\"" +
          escapeHTML(item.name) +
          "\" data-cost=\"" +
          escapeHTML(item.costPrice) +
          "\" data-sale=\"" +
          escapeHTML(item.salePrice) +
          "\">加批次</button>" +
          "<button class=\"ghost-btn js-edit-product\" data-id=\"" +
          escapeHTML(item.id) +
          "\">编辑</button>" +
          "<button class=\"ghost-btn danger js-delete-product\" data-id=\"" +
          escapeHTML(item.id) +
          "\">删除</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  async function renderCustomers() {
    const [customers, allHistory] = await Promise.all([
      window.DB.listCustomers(),
      window.DB.listPurchaseHistory()
    ]);
    if (!customers.length) {
      customerList.className = "card-list empty-tip";
      customerList.textContent = "暂无客户。";
      return;
    }
    const historyMap = new Map();
    allHistory.forEach((h) => {
      if (!historyMap.has(h.customerId)) {
        historyMap.set(h.customerId, []);
      }
      historyMap.get(h.customerId).push(h);
    });
    historyMap.forEach((list) => {
      list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    });

    customerList.className = "card-list";
    customerList.innerHTML = customers
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => {
        const history = historyMap.get(item.id) || [];
        const historyHTML = history.length
          ? "<div class=\"purchase-history\">" +
            "<div class=\"ph-title\">购买记录（" + history.length + "）</div>" +
            "<div class=\"ph-list\">" +
            history.map((h) => {
              return (
                "<div class=\"ph-item\">" +
                "<div class=\"ph-main\">" +
                "<span class=\"ph-name\">" + escapeHTML(h.productName) + "</span>" +
                "<span class=\"ph-qty\">×" + escapeHTML(h.quantity) + "</span>" +
                "</div>" +
                (h.note ? "<div class=\"ph-note\">" + escapeHTML(h.note) + "</div>" : "") +
                "<div class=\"ph-time\">" + escapeHTML(formatDateTime(h.shippedAt)) + "</div>" +
                "</div>"
              );
            }).join("") +
            "</div></div>"
          : "<div class=\"purchase-history\"><div class=\"ph-empty\">暂无购买记录</div></div>";

        return (
          "<details class=\"customer-card\">" +
          "<summary class=\"customer-summary\">" +
          "<span class=\"customer-name\">" +
          escapeHTML(item.name) +
          (history.length ? " <small class=\"ph-badge\">" + history.length + "单</small>" : "") +
          "</span>" +
          "<div class=\"row-actions\">" +
          "<button class=\"ghost-btn js-edit-customer\" data-id=\"" +
          escapeHTML(item.id) +
          "\">编辑</button>" +
          "<button class=\"ghost-btn danger js-delete-customer\" data-id=\"" +
          escapeHTML(item.id) +
          "\">删除</button>" +
          "</div>" +
          "</summary>" +
          historyHTML +
          "</details>"
        );
      })
      .join("");
  }

  async function renderCategories() {
    const [categories, products] = await Promise.all([window.DB.listCategories(), window.DB.listProducts()]);
    const productsByCategory = new Map();
    products.forEach((item) => {
      const key = item.categoryId || "__none__";
      if (!productsByCategory.has(key)) {
        productsByCategory.set(key, []);
      }
      productsByCategory.get(key).push(item);
    });
    if (!categories.length) {
      categoryList.className = "card-list empty-tip";
      categoryList.textContent = "暂无分类。";
      return;
    }
    categoryList.className = "card-list";
    categoryList.innerHTML = categories
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((item) => {
        const categoryProducts = (productsByCategory.get(item.id) || []).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
        const productsHTML = categoryProducts.length
          ? categoryProducts
              .map((product) => {
                return (
                  "<div class=\"category-product-row\">" +
                  "<span>" +
                  escapeHTML(product.name) +
                  "</span>" +
                  "<small>库存 " +
                  escapeHTML(product.stock) +
                  " | 进价 " +
                  formatMoney(product.costPrice) +
                  " | 售价 " +
                  formatMoney(product.salePrice) +
                  "</small>" +
                  "</div>"
                );
              })
              .join("")
          : "<div class=\"item-meta\">该分类下暂无商品</div>";
        return (
          "<details class=\"category-details\" data-group=\"" +
          escapeHTML(item.id) +
          "\" " +
          (getOpenState(state.categoryOpenState, item.id, true) ? "open" : "") +
          ">" +
          "<summary>" +
          escapeHTML(item.name) +
          "（" +
          categoryProducts.length +
          "）</summary>" +
          "<div class=\"category-products\">" +
          productsHTML +
          "</div>" +
          "<div class=\"row-actions\">" +
          "<button class=\"ghost-btn js-edit-category\" data-id=\"" +
          escapeHTML(item.id) +
          "\">编辑</button>" +
          "<button class=\"ghost-btn danger js-delete-category\" data-id=\"" +
          escapeHTML(item.id) +
          "\">删除</button>" +
          "</div>" +
          "</details>"
        );
      })
      .join("");
  }

  async function refreshAll() {
    const scrollY = state.uiLock ? window.scrollY : 0;
    await renderProductCategoryOptions();
    await Promise.all([renderPreorders(), renderFulfillments(), renderProducts(), renderCustomers(), renderCategories()]);
    await renderStats();
    if (state.uiLock) {
      window.scrollTo(0, scrollY);
    }
  }

  function updateModeButtons() {
    modeButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === state.preorderViewMode));
  }

  function setDefaultDateRange() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    statsEnd.value = yyyy + "-" + mm + "-" + dd;
    statsStart.value = yyyy + "-" + mm + "-01";
  }

  function bindEvents() {
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    sideNavButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
        closeSideMenu();
      });
    });

    openSideMenuBtn.addEventListener("click", openSideMenu);
    closeSideMenuBtn.addEventListener("click", closeSideMenu);
    menuMask.addEventListener("click", closeSideMenu);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSideMenu();
      }
    });

    exportBackupBtn.addEventListener("click", async () => {
      try {
        const payload = await window.DB.exportAllData();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = makeBackupFilename();
        link.click();
        URL.revokeObjectURL(url);
        closeSideMenu();
        showToast("备份导出成功");
      } catch (error) {
        showToast(error.message || "导出备份失败");
      }
    });

    importBackupFileInput.addEventListener("change", async () => {
      const file = importBackupFileInput.files && importBackupFileInput.files[0];
      if (!file) {
        return;
      }
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        const ok = await customConfirm("导入会覆盖当前本地数据，确定继续吗？");
        if (!ok) {
          importBackupFileInput.value = "";
          return;
        }
        await window.DB.importAllData(payload);
        await refreshAll();
        closeSideMenu();
        showToast("备份导入成功");
      } catch (error) {
        showToast(error.message || "导入备份失败");
      } finally {
        importBackupFileInput.value = "";
      }
    });

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.preorderViewMode = btn.dataset.mode;
        localStorage.setItem("preorder-view-mode", state.preorderViewMode);
        updateModeButtons();
        await renderPreorders();
      });
    });

    preorderSearchInput.addEventListener("input", () => {
      renderPreorders();
    });

    preorderSearchToggle.addEventListener("click", () => {
      preorderSearchInput.classList.toggle("search-open");
      if (preorderSearchInput.classList.contains("search-open")) {
        preorderSearchToggle.style.display = "none";
        preorderSearchInput.focus();
      }
    });

    preorderSearchInput.addEventListener("blur", () => {
      if (!preorderSearchInput.value.trim()) {
        preorderSearchInput.classList.remove("search-open");
        preorderSearchToggle.style.display = "";
      }
    });

    preorderList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.classList.contains("js-toggle-bought")) {
        const id = target.dataset.id;
        const ok = await customConfirm("确认已买到？库存将自动增加。");
        if (!ok) return;
        try {
          await window.DB.markPreorderBought(id);
          showToast("已买到，库存已更新");
          await refreshAll();
        } catch (error) {
          showToast(error.message || "操作失败");
        }
        return;
      }
      if (target.classList.contains("js-delete-preorder")) {
        const id = target.dataset.id;
        if (!id) return;
        try {
          await window.DB.deletePreorder(id);
          showToast("已删除");
          await refreshAll();
        } catch (error) {
          showToast(error.message || "删除失败");
        }
        return;
      }
      if (target.classList.contains("js-edit-preorder")) {
        const id = target.dataset.id;
        if (!id) return;
        const { records } = await window.DB.getAllJoined();
        const match = records.find((r) => r.preorder.id === id);
        if (!match) return;
        preorderEditId.value = id;
        preorderModalTitle.textContent = "编辑预购订单";
        preorderCategoryInput.value = (match.category && match.category.name) || "";
        preorderCustomerInput.value = (match.customer && match.customer.name) || "";
        preorderProductInput.value = (match.product && match.product.name) || "";
        preorderQtyInput.value = String(match.preorder.quantity || 1);
        preorderCostPriceInput.value = String(match.preorder.costPrice || 0);
        preorderSalePriceInput.value = String(match.preorder.salePrice || 0);
        preorderNoteInput.value = match.preorder.note || "";
        resetAddMode();
        preorderBatchActions.style.display = "none";
        preorderModal.showModal();
      }
    });

    openPreorderModalBtn.addEventListener("click", () => {
      preorderEditId.value = "";
      preorderModalTitle.textContent = "新增预购订单";
      preorderForm.reset();
      preorderQtyInput.value = "1";
      preorderCostPriceInput.value = "0";
      preorderSalePriceInput.value = "0";
      resetAddMode();
      preorderModal.showModal();
    });

    function resetAddMode() {
      state.addMode = "single";
      preorderLockedInfo.style.display = "none";
      preorderLockedInfo.innerHTML = "";
      preorderFieldCategory.classList.remove("field-locked");
      preorderFieldCustomer.classList.remove("field-locked");
      preorderFieldProduct.classList.remove("field-locked");
      preorderFieldPrices.classList.remove("field-locked");
      preorderBatchActions.style.display = "";
      preorderContinueActions.style.display = "none";
      preorderSubmitBtn.style.display = "";
    }

    function enterBatchMode(mode) {
      state.addMode = mode;
      preorderBatchActions.style.display = "none";
      preorderContinueActions.style.display = "";
      preorderSubmitBtn.style.display = "none";

      if (mode === "batch-customer") {
        preorderModalTitle.textContent = "连续添加买家";
        var info = "<strong>锁定商品：</strong>" +
          escapeHTML(preorderProductInput.value) +
          " | 进价 " + escapeHTML(preorderCostPriceInput.value) +
          " | 售价 " + escapeHTML(preorderSalePriceInput.value);
        if (preorderCategoryInput.value) {
          info = "<strong>分类：</strong>" + escapeHTML(preorderCategoryInput.value) + " | " + info;
        }
        preorderLockedInfo.innerHTML = info;
        preorderLockedInfo.style.display = "";
        preorderFieldCategory.classList.add("field-locked");
        preorderFieldProduct.classList.add("field-locked");
        preorderFieldPrices.classList.add("field-locked");
      } else {
        preorderModalTitle.textContent = "连续添加商品";
        preorderLockedInfo.innerHTML = "<strong>锁定客户：</strong>" + escapeHTML(preorderCustomerInput.value);
        preorderLockedInfo.style.display = "";
        preorderFieldCustomer.classList.add("field-locked");
      }
    }

    preorderDoneBtn.addEventListener("click", () => {
      preorderModal.close();
      state.addMode = "single";
    });
    closePreorderModalBtn.addEventListener("click", () => {
      preorderEditId.value = "";
      preorderModal.close();
    });

    preorderCategoryInput.addEventListener("input", () =>
      onSuggest(preorderCategoryInput, window.DB.searchCategoryNames, categorySuggestions)
    );
    preorderCustomerInput.addEventListener("input", () =>
      onSuggest(preorderCustomerInput, window.DB.searchCustomerNames, customerSuggestions)
    );
    preorderProductInput.addEventListener("input", () =>
      onSuggest(preorderProductInput, window.DB.searchProductNames, productSuggestions)
    );
    preorderProductInput.addEventListener("change", async () => {
      const product = await window.DB.getProductByName(preorderProductInput.value.trim());
      if (!product) {
        return;
      }
      preorderCostPriceInput.value = String(numberOrZero(product.costPrice));
      preorderSalePriceInput.value = String(numberOrZero(product.salePrice));
    });

    async function savePreorderAndContinue() {
      const editId = preorderEditId.value;
      const payload = {
        categoryName: preorderCategoryInput.value,
        customerName: preorderCustomerInput.value,
        productName: preorderProductInput.value,
        quantity: Number(preorderQtyInput.value),
        costPrice: Number(preorderCostPriceInput.value),
        salePrice: Number(preorderSalePriceInput.value),
        note: preorderNoteInput.value
      };
      try {
        if (editId) {
          await window.DB.updatePreorder(editId, payload);
        } else {
          await window.DB.createPreorderWithAutoCreate(payload);
        }

        preorderEditId.value = "";

        if (state.addMode === "batch-customer") {
          preorderCustomerInput.value = "";
          preorderNoteInput.value = "";
          preorderQtyInput.value = "1";
          showToast("已保存，请输入下一位买家");
          await refreshAll();
          preorderCustomerInput.focus();
          return;
        }

        if (state.addMode === "batch-product") {
          preorderProductInput.value = "";
          preorderQtyInput.value = "1";
          preorderCostPriceInput.value = "0";
          preorderSalePriceInput.value = "0";
          preorderNoteInput.value = "";
          showToast("已保存，请输入下一个商品");
          await refreshAll();
          preorderProductInput.focus();
          return;
        }

        preorderForm.reset();
        preorderQtyInput.value = "1";
        preorderCostPriceInput.value = "0";
        preorderSalePriceInput.value = "0";
        preorderModal.close();
        await refreshAll();
      } catch (error) {
        showToast(error.message || "保存订单失败");
      }
    }

    preorderForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await savePreorderAndContinue();
    });

    saveNextCustomerBtn.addEventListener("click", async () => {
      if (!preorderForm.reportValidity()) return;
      try {
        await window.DB.createPreorderWithAutoCreate({
          categoryName: preorderCategoryInput.value,
          customerName: preorderCustomerInput.value,
          productName: preorderProductInput.value,
          quantity: Number(preorderQtyInput.value),
          costPrice: Number(preorderCostPriceInput.value),
          salePrice: Number(preorderSalePriceInput.value),
          note: preorderNoteInput.value
        });
        enterBatchMode("batch-customer");
        preorderEditId.value = "";
        preorderCustomerInput.value = "";
        preorderNoteInput.value = "";
        preorderQtyInput.value = "1";
        showToast("已保存，请输入下一位买家");
        await refreshAll();
        preorderCustomerInput.focus();
      } catch (error) {
        showToast(error.message || "保存订单失败");
      }
    });

    saveNextProductBtn.addEventListener("click", async () => {
      if (!preorderForm.reportValidity()) return;
      try {
        await window.DB.createPreorderWithAutoCreate({
          categoryName: preorderCategoryInput.value,
          customerName: preorderCustomerInput.value,
          productName: preorderProductInput.value,
          quantity: Number(preorderQtyInput.value),
          costPrice: Number(preorderCostPriceInput.value),
          salePrice: Number(preorderSalePriceInput.value),
          note: preorderNoteInput.value
        });
        enterBatchMode("batch-product");
        preorderEditId.value = "";
        preorderProductInput.value = "";
        preorderQtyInput.value = "1";
        preorderCostPriceInput.value = "0";
        preorderSalePriceInput.value = "0";
        preorderNoteInput.value = "";
        showToast("已保存，请输入下一个商品");
        await refreshAll();
        preorderProductInput.focus();
      } catch (error) {
        showToast(error.message || "保存订单失败");
      }
    });

    fulfillmentFilter.addEventListener("change", renderFulfillments);
    fulfillmentList.addEventListener("toggle", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement)) {
        return;
      }
      if (!target.classList.contains("fulfillment-customer-card")) {
        return;
      }
      setOpenState("fulfillment", target.dataset.group || "", target.open);
    });
    fulfillmentList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.classList.contains("js-toggle-paid")) {
        const id = target.dataset.id;
        const next = target.dataset.next === "1";
        if (!id) {
          return;
        }
        try {
          await window.DB.toggleFulfillmentPaid(id, next);
          await Promise.all([renderFulfillments(), renderCustomers(), renderStats()]);
        } catch (error) {
          showToast(error.message || "更新付款状态失败");
        }
        return;
      }
      if (target.classList.contains("js-toggle-shipped")) {
        const id = target.dataset.id;
        const next = target.dataset.next === "1";
        if (!id) {
          return;
        }
        try {
          await window.DB.toggleFulfillmentShipped(id, next);
          await Promise.all([renderFulfillments(), renderCustomers(), renderStats()]);
        } catch (error) {
          showToast(error.message || "更新发货状态失败");
        }
        return;
      }
      if (target.classList.contains("js-open-billing")) {
        event.preventDefault();
        const customerId = target.dataset.customer;
        const customerName = target.dataset.name || "客户";
        if (!customerId) {
          return;
        }
        await openBillingModal(customerId, customerName);
        return;
      }
      if (target.classList.contains("js-delete-fulfillment")) {
        const id = target.dataset.id;
        if (!id) {
          return;
        }
        try {
          await window.DB.removeFulfillmentItem(id);
          showToast("已删除");
          await refreshAll();
        } catch (error) {
          showToast(error.message || "删除失败");
        }
      }
    });

    categoryList.addEventListener("toggle", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement)) {
        return;
      }
      if (!target.classList.contains("category-details")) {
        return;
      }
      setOpenState("category", target.dataset.group || "", target.open);
    });

    billingRows.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !state.billingDraft) {
        return;
      }
      const rowInput = target;
      const preorderId = rowInput.dataset.id;
      if (!preorderId) {
        return;
      }
      const row = state.billingDraft.rows.find((item) => item.preorderId === preorderId);
      if (!row) {
        return;
      }
      if (rowInput.classList.contains("js-billing-qty")) {
        row.quantity = Math.max(1, Math.floor(numberOrZero(rowInput.value)));
      } else if (rowInput.classList.contains("js-billing-cost")) {
        row.costPrice = Math.max(0, numberOrZero(rowInput.value));
      } else if (rowInput.classList.contains("js-billing-sale")) {
        row.salePrice = Math.max(0, numberOrZero(rowInput.value));
      } else if (rowInput.classList.contains("js-billing-deposit")) {
        row.deposit = Math.max(0, numberOrZero(rowInput.value));
      } else if (rowInput.classList.contains("js-billing-paid")) {
        row.isPaid = rowInput.checked;
      }
      recalcBillingTotals();
      renderBillPreview();
    });

    billingShippingFee.addEventListener("input", () => {
      recalcBillingTotals();
      renderBillPreview();
    });

    billingTotalCost.addEventListener("input", () => {
      recalcBillingTotals();
      renderBillPreview();
    });

    generateBillingBtn.addEventListener("click", () => {
      renderBillPreview();
      if (!state.billingDraft) {
        return;
      }
      renderReportPage();
    });

    closeBillingModalBtn.addEventListener("click", () => {
      billingModal.close();
    });
    closeReportModalBtn.addEventListener("click", () => {
      reportModal.close();
    });
    reportBackBtn.addEventListener("click", () => {
      reportModal.close();
      billingModal.showModal();
    });

    productSearchInput.addEventListener("input", () => {
      renderProducts();
    });
    productSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    billingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!state.billingDraft) {
        return;
      }
      try {
        await window.DB.saveCustomerBilling(state.billingDraft.customerId, {
          rows: state.billingDraft.rows,
          shippingFee: numberOrZero(billingShippingFee.value)
        });
        billingModal.close();
        await Promise.all([renderFulfillments(), renderStats(), renderPreorders()]);
        showToast("账单数据已保存");
      } catch (error) {
        showToast(error.message || "保存账单失败");
      }
    });

    runStatsBtn.addEventListener("click", renderStats);

    productForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await window.DB.saveProduct({
          id: productIdInput.value || "",
          name: productNameInput.value,
          categoryId: productCategorySelect.value,
          stock: Number(productStockInput.value),
          costPrice: Number(productCostInput.value),
          salePrice: Number(productSaleInput.value)
        });
        resetProductForm();
        productModal.close();
        await Promise.all([renderProducts(), renderPreorders(), renderStats()]);
      } catch (error) {
        showToast(error.message || "保存商品失败");
      }
    });

    productResetBtn.addEventListener("click", resetProductForm);
    openProductModalBtn.addEventListener("click", () => {
      resetProductForm();
      openProductModal();
    });
    closeProductModalBtn.addEventListener("click", () => {
      productModal.close();
    });
    closeBatchModalBtn.addEventListener("click", () => {
      batchModal.close();
    });

    batchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await window.DB.addOrUpdateProductBatch({
          productId: batchProductIdInput.value,
          batchName: batchNameInput.value,
          stockDelta: Number(batchStockDeltaInput.value),
          costPrice: Number(batchCostPriceInput.value),
          salePrice: Number(batchSalePriceInput.value)
        });
        batchModal.close();
        await renderProducts();
        showToast("批次已更新");
      } catch (error) {
        showToast(error.message || "保存批次失败");
      }
    });

    productList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (target.classList.contains("js-add-batch")) {
        batchProductIdInput.value = target.dataset.id || "";
        batchTitle.textContent = (target.dataset.name || "商品") + " - 新增批次";
        batchNameInput.value = "";
        batchStockDeltaInput.value = "1";
        batchCostPriceInput.value = String(numberOrZero(target.dataset.cost));
        batchSalePriceInput.value = String(numberOrZero(target.dataset.sale));
        batchModal.showModal();
        return;
      }
      if (target.classList.contains("js-edit-product")) {
        const id = target.dataset.id;
        if (!id) {
          return;
        }
        const products = await window.DB.listProducts();
        const item = products.find((x) => x.id === id);
        if (!item) {
          return;
        }
        productIdInput.value = item.id;
        productNameInput.value = item.name;
        productCategorySelect.value = item.categoryId || "";
        productStockInput.value = String(item.stock || 0);
        productCostInput.value = String(item.costPrice || 0);
        productSaleInput.value = String(item.salePrice || 0);
        switchTab("products");
        openProductModal();
        return;
      }
      if (target.classList.contains("js-delete-product")) {
        const id = target.dataset.id;
        if (!id) {
          return;
        }
        if (!await customConfirm("确定删除该商品吗？")) {
          return;
        }
        try {
          await window.DB.removeProduct(id);
          await Promise.all([renderProducts(), renderPreorders(), renderStats()]);
        } catch (error) {
          showToast(error.message || "删除商品失败");
        }
      }
    });

    customerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await window.DB.saveCustomer("", customerNameInput.value);
        customerNameInput.value = "";
        await Promise.all([renderCustomers(), renderPreorders(), renderFulfillments(), renderStats()]);
      } catch (error) {
        showToast(error.message || "新增客户失败");
      }
    });

    customerList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const id = target.dataset.id;
      if (!id) {
        return;
      }
      if (target.classList.contains("js-edit-customer")) {
        event.preventDefault();
        const all = await window.DB.listCustomers();
        const current = all.find((item) => item.id === id);
        if (!current) {
          return;
        }
        const nextName = await customPrompt("编辑客户姓名", current.name);
        if (!nextName) {
          return;
        }
        try {
          await window.DB.saveCustomer(id, nextName);
          await Promise.all([renderCustomers(), renderPreorders(), renderFulfillments(), renderStats()]);
        } catch (error) {
          showToast(error.message || "更新客户失败");
        }
        return;
      }
      if (target.classList.contains("js-delete-customer")) {
        event.preventDefault();
        if (!await customConfirm("确定删除该客户吗？")) {
          return;
        }
        try {
          await window.DB.removeCustomer(id);
          await Promise.all([renderCustomers(), renderPreorders(), renderFulfillments(), renderStats()]);
        } catch (error) {
          showToast(error.message || "删除客户失败");
        }
      }
    });

    categoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await window.DB.saveCategory("", categoryNameInput.value);
        categoryNameInput.value = "";
        await Promise.all([renderCategories(), renderProductCategoryOptions(), renderPreorders()]);
      } catch (error) {
        showToast(error.message || "新增分类失败");
      }
    });

    categoryList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const id = target.dataset.id;
      if (!id) {
        return;
      }
      if (target.classList.contains("js-edit-category")) {
        const all = await window.DB.listCategories();
        const current = all.find((item) => item.id === id);
        if (!current) {
          return;
        }
        const nextName = await customPrompt("编辑分类名称", current.name);
        if (!nextName) {
          return;
        }
        try {
          await window.DB.saveCategory(id, nextName);
          await Promise.all([renderCategories(), renderProductCategoryOptions(), renderPreorders()]);
        } catch (error) {
          showToast(error.message || "更新分类失败");
        }
        return;
      }
      if (target.classList.contains("js-delete-category")) {
        if (!await customConfirm("确定删除该分类吗？")) {
          return;
        }
        try {
          await window.DB.removeCategory(id);
          await Promise.all([renderCategories(), renderProductCategoryOptions(), renderPreorders()]);
        } catch (error) {
          showToast(error.message || "删除分类失败");
        }
      }
    });
  }

  (function initSwipeGestures() {
    let startX = 0;
    let currentRow = null;
    let swipeDir = null;
    const THRESHOLD = 50;
    const DISTANCE = 70;

    function closeAllSwiped(except) {
      document.querySelectorAll(".swipe-row.swiped-left, .swipe-row.swiped-right").forEach((el) => {
        if (el !== except) {
          el.classList.remove("swiped-left", "swiped-right", "swiped", "swiping");
        }
      });
    }

    function onTouchStart(e) {
      const row = e.target.closest(".swipe-row");
      if (!row) return;
      startX = e.touches[0].clientX;
      currentRow = row;
      swipeDir = row.dataset.swipeDir || "left";
      currentRow.classList.add("swiping");
    }

    function onTouchMove(e) {
      if (!currentRow) return;
      const content = currentRow.querySelector(".swipe-content");
      if (!content) return;
      const dx = e.touches[0].clientX - startX;
      const isOpen = currentRow.classList.contains("swiped-left") || currentRow.classList.contains("swiped-right");

      if (swipeDir === "left") {
        if (!isOpen && dx < 0) {
          content.style.transform = "translateX(" + Math.max(dx, -DISTANCE) + "px)";
          content.style.transition = "none";
        } else if (isOpen && dx > 0) {
          content.style.transform = "translateX(" + Math.min(dx - DISTANCE, 0) + "px)";
          content.style.transition = "none";
        }
      } else {
        if (!isOpen && dx > 0) {
          content.style.transform = "translateX(" + Math.min(dx, DISTANCE) + "px)";
          content.style.transition = "none";
        } else if (isOpen && dx < 0) {
          content.style.transform = "translateX(" + Math.max(dx + DISTANCE, 0) + "px)";
          content.style.transition = "none";
        }
      }
    }

    function onTouchEnd(e) {
      if (!currentRow) return;
      const content = currentRow.querySelector(".swipe-content");
      if (!content) return;
      const dx = e.changedTouches[0].clientX - startX;
      const isOpen = currentRow.classList.contains("swiped-left") || currentRow.classList.contains("swiped-right");
      content.style.transition = "";
      content.style.transform = "";
      currentRow.classList.remove("swiping");

      if (swipeDir === "left") {
        if (!isOpen && dx < -THRESHOLD) {
          closeAllSwiped(currentRow);
          currentRow.classList.add("swiped", "swiped-left");
        } else if (isOpen && dx > THRESHOLD) {
          currentRow.classList.remove("swiped", "swiped-left");
        }
      } else {
        if (!isOpen && dx > THRESHOLD) {
          closeAllSwiped(currentRow);
          currentRow.classList.add("swiped", "swiped-right");
        } else if (isOpen && dx < -THRESHOLD) {
          currentRow.classList.remove("swiped", "swiped-right");
        }
      }
      currentRow = null;
      swipeDir = null;
    }

    document.addEventListener("touchstart", (e) => {
      if (e.target.closest(".swipe-row")) {
        onTouchStart(e);
      } else {
        closeAllSwiped(null);
      }
    }, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
  })();

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.warn("service worker register failed:", error);
    }
  }

  async function bootstrap() {
    localStorage.removeItem("ui-lock-mode");
    setDefaultDateRange();
    bindEvents();
    applyUiLockMode();
    updateModeButtons();
    switchTab(state.activeTab);
    await window.DB.openDB();
    await refreshAll();
    await registerServiceWorker();
  }

  bootstrap();
})();
