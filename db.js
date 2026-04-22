(function () {
  const DB_NAME = "daigou-accounting-db";
  const DB_VERSION = 4;
  const STORE_NAMES = ["categories", "customers", "products", "preorders", "fulfillments", "productBatches", "purchaseHistory"];

  let dbPromise;

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function todayBatchName() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function normalizeBatchName(name) {
    const clean = String(name || "").trim();
    return clean || todayBatchName();
  }

  function uid() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "id_" + Date.now() + "_" + Math.random().toString(16).slice(2);
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
    });
  }

  function txDone(tx) {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  }

  function ensureFulfillmentFlags(record) {
    const isPaid = !!record.isPaid;
    const isShipped = !!record.isShipped;
    const isCompleted = isPaid && isShipped;
    return {
      ...record,
      isPaid,
      isShipped,
      isCompleted,
      paidAt: record.paidAt || "",
      shippedAt: record.shippedAt || "",
      completedAt: isCompleted ? record.completedAt || nowISO() : ""
    };
  }

  function backfillStoreDefaults(store, fillFn) {
    const req = store.openCursor();
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor) {
        return;
      }
      const value = cursor.value;
      const nextValue = fillFn(value);
      cursor.update(nextValue);
      cursor.continue();
    };
  }

  function openDB() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (event) => {
          const db = event.target.result;
          const tx = event.target.transaction;
          const oldVersion = event.oldVersion;
          if (!db.objectStoreNames.contains("categories")) {
            const store = db.createObjectStore("categories", { keyPath: "id" });
            store.createIndex("nameLower", "nameLower", { unique: true });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("customers")) {
            const store = db.createObjectStore("customers", { keyPath: "id" });
            store.createIndex("nameLower", "nameLower", { unique: true });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("products")) {
            const store = db.createObjectStore("products", { keyPath: "id" });
            store.createIndex("nameLower", "nameLower", { unique: true });
            store.createIndex("categoryId", "categoryId", { unique: false });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("preorders")) {
            const store = db.createObjectStore("preorders", { keyPath: "id" });
            store.createIndex("categoryId", "categoryId", { unique: false });
            store.createIndex("customerId", "customerId", { unique: false });
            store.createIndex("productId", "productId", { unique: false });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("fulfillments")) {
            const store = db.createObjectStore("fulfillments", { keyPath: "id" });
            store.createIndex("preorderId", "preorderId", { unique: true });
            store.createIndex("customerId", "customerId", { unique: false });
            store.createIndex("isCompleted", "isCompleted", { unique: false });
            store.createIndex("isPaid", "isPaid", { unique: false });
            store.createIndex("isShipped", "isShipped", { unique: false });
            store.createIndex("completedAt", "completedAt", { unique: false });
            store.createIndex("createdAt", "createdAt", { unique: false });
          } else if (oldVersion < 2) {
            const store = tx.objectStore("fulfillments");
            if (!store.indexNames.contains("isPaid")) {
              store.createIndex("isPaid", "isPaid", { unique: false });
            }
            if (!store.indexNames.contains("isShipped")) {
              store.createIndex("isShipped", "isShipped", { unique: false });
            }
          }

          if (!db.objectStoreNames.contains("productBatches")) {
            const store = db.createObjectStore("productBatches", { keyPath: "id" });
            store.createIndex("productId", "productId", { unique: false });
            store.createIndex("batchKey", "batchKey", { unique: true });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }

          if (!db.objectStoreNames.contains("purchaseHistory")) {
            const store = db.createObjectStore("purchaseHistory", { keyPath: "id" });
            store.createIndex("customerId", "customerId", { unique: false });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }

          if (oldVersion < 2) {
            const preorderStore = tx.objectStore("preorders");
            backfillStoreDefaults(preorderStore, (value) => {
              return {
                ...value,
                costPrice: Number(value.costPrice) || 0,
                salePrice: Number(value.salePrice) || 0,
                deposit: Number(value.deposit) || 0,
                batchId: value.batchId || "",
                batchName: value.batchName || ""
              };
            });

            const fulfillmentStore = tx.objectStore("fulfillments");
            backfillStoreDefaults(fulfillmentStore, (value) => ensureFulfillmentFlags(value));
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB"));
      });
    }
    return dbPromise;
  }

  async function withTransaction(storeNames, mode, handler) {
    const db = await openDB();
    const tx = db.transaction(storeNames, mode);
    const stores = {};
    storeNames.forEach((name) => {
      stores[name] = tx.objectStore(name);
    });
    const value = await handler(stores, tx);
    await txDone(tx);
    return value;
  }

  async function getAll(storeName) {
    return withTransaction([storeName], "readonly", async (stores) => {
      return requestToPromise(stores[storeName].getAll());
    });
  }

  async function findByName(storeName, name) {
    const nameLower = normalizeName(name);
    if (!nameLower) {
      return null;
    }
    return withTransaction([storeName], "readonly", async (stores) => {
      return requestToPromise(stores[storeName].index("nameLower").get(nameLower));
    });
  }

  async function upsertNamedEntity(storeName, payload) {
    const name = String(payload.name || "").trim();
    if (!name) {
      throw new Error("名称不能为空");
    }
    const existing = await findByName(storeName, name);
    if (existing && (!payload.id || payload.id === existing.id)) {
      return existing;
    }
    const now = nowISO();
    const entity = {
      id: payload.id || uid(),
      name,
      nameLower: normalizeName(name),
      createdAt: payload.createdAt || now,
      updatedAt: now
    };
    return withTransaction([storeName], "readwrite", async (stores) => {
      stores[storeName].put(entity);
      return entity;
    });
  }

  async function addOrGetCategory(name) {
    const existing = await findByName("categories", name);
    if (existing) {
      return existing;
    }
    return upsertNamedEntity("categories", { name });
  }

  async function addOrGetCustomer(name) {
    const existing = await findByName("customers", name);
    if (existing) {
      return existing;
    }
    return upsertNamedEntity("customers", { name });
  }

  async function getProductByName(name) {
    return findByName("products", name);
  }

  async function addOrGetProduct(name, categoryId, pricingInput) {
    const cleanName = String(name || "").trim();
    if (!cleanName) {
      throw new Error("商品名不能为空");
    }
    const existing = await findByName("products", cleanName);
    if (existing) {
      const nextCost = Number(pricingInput && pricingInput.costPrice);
      const beforeCost = Number(existing.costPrice) || 0;
      if (!existing.categoryId && categoryId) {
        existing.categoryId = categoryId;
        existing.updatedAt = nowISO();
        await withTransaction(["products"], "readwrite", async (stores) => {
          stores.products.put(existing);
        });
      }
      return {
        product: existing,
        existed: true,
        costChanged: !Number.isNaN(nextCost) && nextCost > 0 && beforeCost !== nextCost,
        beforeCost: beforeCost
      };
    }
    const now = nowISO();
    const product = {
      id: uid(),
      name: cleanName,
      nameLower: normalizeName(cleanName),
      categoryId: categoryId || "",
      stock: 0,
      costPrice: Number(pricingInput && pricingInput.costPrice) || 0,
      salePrice: Number(pricingInput && pricingInput.salePrice) || 0,
      createdAt: now,
      updatedAt: now
    };
    return withTransaction(["products"], "readwrite", async (stores) => {
      stores.products.add(product);
      return {
        product,
        existed: false,
        costChanged: false
      };
    });
  }

  async function upsertBatchForProduct(product, qty, inputCost, inputSale) {
    const baseName = todayBatchName();
    const quantity = Number(qty) || 0;
    const costPrice = Number(inputCost) || Number(product.costPrice) || 0;
    const salePrice = Number(inputSale) || Number(product.salePrice) || 0;
    const now = nowISO();
    return withTransaction(["productBatches"], "readwrite", async (stores) => {
      // 查找今天同商品的所有批次
      const allBatches = await requestToPromise(stores.productBatches.index("productId").getAll(product.id));
      const todayBatches = allBatches.filter(function (b) { return b.batchName.startsWith(baseName); });

      // 找进价相同的今天批次
      const sameCostBatch = todayBatches.find(function (b) { return (Number(b.costPrice) || 0) === costPrice; });
      if (sameCostBatch) {
        sameCostBatch.stock = Number(sameCostBatch.stock) + quantity;
        sameCostBatch.salePrice = salePrice;
        sameCostBatch.updatedAt = now;
        stores.productBatches.put(sameCostBatch);
        return sameCostBatch;
      }

      // 进价不同，创建新批次，名称加序号
      var batchName = baseName;
      if (todayBatches.length > 0) {
        batchName = baseName + "-" + (todayBatches.length + 1);
      }
      var batchKey = product.id + "__" + batchName;

      const batch = {
        id: uid(),
        productId: product.id,
        batchName: batchName,
        batchKey: batchKey,
        stock: quantity,
        costPrice: costPrice,
        salePrice: salePrice,
        createdAt: now,
        updatedAt: now
      };
      stores.productBatches.add(batch);
      return batch;
    });
  }

  async function addOrUpdateProductBatch(input) {
    const productId = String(input && input.productId ? input.productId : "");
    if (!productId) {
      throw new Error("缺少商品信息");
    }
    const product = await withTransaction(["products"], "readonly", async (stores) => {
      return requestToPromise(stores.products.get(productId));
    });
    if (!product) {
      throw new Error("商品不存在");
    }

    const batchName = normalizeBatchName(input.batchName);
    const batchKey = productId + "__" + batchName;
    const stockDelta = Number(input.stockDelta) || 0;
    const costPrice = Number(input.costPrice);
    const salePrice = Number(input.salePrice);
    const now = nowISO();

    return withTransaction(["productBatches"], "readwrite", async (stores) => {
      const existing = await requestToPromise(stores.productBatches.index("batchKey").get(batchKey));
      const base = existing || {
        id: uid(),
        productId,
        batchName,
        batchKey,
        stock: 0,
        costPrice: Number(product.costPrice) || 0,
        salePrice: salePrice,
        createdAt: now,
        updatedAt: now
      };

      base.stock = Number(base.stock) + stockDelta;
      if (!Number.isNaN(costPrice) && costPrice >= 0) {
        base.costPrice = costPrice;
      }
      if (!Number.isNaN(salePrice) && salePrice >= 0) {
        base.salePrice = salePrice;
      }
      base.updatedAt = now;

      if (base.stock <= 0) {
        if (existing) {
          stores.productBatches.delete(existing.id);
        }
        return { deleted: true, batch: base };
      }

      stores.productBatches.put(base);
      return { deleted: false, batch: base };
    });
  }

  async function createPreorderWithAutoCreate(input) {
    const quantity = Number(input.quantity);
    if (!quantity || quantity < 1) {
      throw new Error("数量必须大于 0");
    }

    const categoryName = String(input.categoryName || "").trim();
    const category = categoryName ? await addOrGetCategory(categoryName) : null;
    const customer = await addOrGetCustomer(input.customerName);
    const productResult = await addOrGetProduct(input.productName, category ? category.id : "", {
      costPrice: input.costPrice,
      salePrice: input.salePrice
    });
    const product = productResult.product;
    const now = nowISO();
    const costPrice = Number(input.costPrice);
    const salePrice = Number(input.salePrice);
    const deposit = Number(input.deposit);

    var batch = null;
    var defaultCost = Number(product.costPrice) || 0;
    var defaultSale = Number(product.salePrice) || 0;
    var inputCost = Number.isNaN(costPrice) ? defaultCost : costPrice;
    var inputSale = Number.isNaN(salePrice) ? defaultSale : salePrice;
    if (inputCost !== defaultCost || inputSale !== defaultSale) {
      batch = await upsertBatchForProduct(product, quantity, inputCost, inputSale);
    }

    const preorder = {
      id: uid(),
      categoryId: category ? category.id : "",
      customerId: customer.id,
      productId: product.id,
      quantity,
      costPrice: Number.isNaN(costPrice) ? Number(product.costPrice) || 0 : costPrice,
      salePrice: Number.isNaN(salePrice) ? Number(product.salePrice) || 0 : salePrice,
      deposit: Number.isNaN(deposit) ? 0 : deposit,
      batchId: (batch && batch.id) || "",
      batchName: (batch && batch.batchName) || "",
      note: String(input.note || "").trim(),
      createdAt: now,
      updatedAt: now
    };
    const fulfillment = {
      id: uid(),
      preorderId: preorder.id,
      customerId: customer.id,
      isPaid: false,
      isShipped: false,
      isCompleted: false,
      paidAt: "",
      shippedAt: "",
      completedAt: "",
      createdAt: now,
      updatedAt: now
    };

    return withTransaction(["preorders", "fulfillments"], "readwrite", async (stores) => {
      stores.preorders.add(preorder);
      stores.fulfillments.add(fulfillment);
      return { preorder, fulfillment };
    });
  }

  async function getAllJoined() {
    const [categories, customers, products, preorders, fulfillments] = await Promise.all(
      STORE_NAMES.map((name) => getAll(name))
    );
    const categoryMap = new Map(categories.map((item) => [item.id, item]));
    const customerMap = new Map(customers.map((item) => [item.id, item]));
    const productMap = new Map(products.map((item) => [item.id, item]));
    const fulfillmentByPreorder = new Map(fulfillments.map((item) => [item.preorderId, item]));

    const records = preorders
      .map((preorder) => {
        const category = categoryMap.get(preorder.categoryId);
        const customer = customerMap.get(preorder.customerId);
        const product = productMap.get(preorder.productId);
        const fulfillment = fulfillmentByPreorder.get(preorder.id);
        return {
          preorder,
          category,
          customer,
          product,
          fulfillment
        };
      })
      .sort((a, b) => b.preorder.createdAt.localeCompare(a.preorder.createdAt));

    return {
      categories,
      customers,
      products,
      preorders,
      fulfillments,
      records
    };
  }

  async function searchNames(storeName, keyword) {
    const cleanKeyword = normalizeName(keyword);
    const all = await getAll(storeName);
    if (!cleanKeyword) {
      return all.slice(0, 20).map((item) => item.name);
    }
    return all
      .filter((item) => item.nameLower.includes(cleanKeyword))
      .slice(0, 20)
      .map((item) => item.name);
  }

  async function searchProductNames(keyword, categoryId) {
    const cleanKeyword = normalizeName(keyword);
    const all = await getAll("products");
    var filtered = all;
    if (categoryId) {
      filtered = filtered.filter((item) => item.categoryId === categoryId);
    }
    if (cleanKeyword) {
      filtered = filtered.filter((item) => item.nameLower.includes(cleanKeyword));
    }
    return filtered.slice(0, 20).map((item) => item.name);
  }

  async function findCategoryByName(name) {
    return findByName("categories", name);
  }

  async function adjustBatchStockForShipment(stores, preorder, shippedNext) {
    if (!preorder || !preorder.batchId) {
      return;
    }
    const qty = Number(preorder.quantity) || 0;
    if (!qty) {
      return;
    }
    const current = await requestToPromise(stores.productBatches.get(preorder.batchId));
    const now = nowISO();
    let batch = current;
    if (!batch) {
      batch = {
        id: preorder.batchId,
        productId: preorder.productId,
        batchName: preorder.batchName || todayBatchName(),
        batchKey: preorder.productId + "__" + (preorder.batchName || todayBatchName()),
        stock: 0,
        costPrice: Number(preorder.costPrice) || 0,
        salePrice: Number(preorder.salePrice) || 0,
        createdAt: now,
        updatedAt: now
      };
    }
    batch.stock = Number(batch.stock) + (shippedNext ? -qty : qty);
    batch.updatedAt = now;
    if (batch.stock <= 0) {
      stores.productBatches.delete(batch.id);
      return;
    }
    stores.productBatches.put(batch);
  }

  async function toggleFulfillmentStatus(fulfillmentId, field, nextValue) {
    return withTransaction(["fulfillments", "preorders", "products", "productBatches", "purchaseHistory"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.fulfillments.get(fulfillmentId));
      if (!record) {
        throw new Error("记录不存在");
      }
      const wasBothDone = !!record.isPaid && !!record.isShipped;
      const now = nowISO();
      if (field === "paid") {
        record.isPaid = !!nextValue;
        record.paidAt = record.isPaid ? now : "";
      }
      if (field === "shipped") {
        const shippedNext = !!nextValue;
        const shippedBefore = !!record.isShipped;
        record.isShipped = shippedNext;
        record.shippedAt = record.isShipped ? now : "";
        if (shippedBefore !== shippedNext) {
          const preorder = await requestToPromise(stores.preorders.get(record.preorderId));
          await adjustBatchStockForShipment(stores, preorder, shippedNext);
        }
      }
      const isBothDoneNow = !!record.isPaid && !!record.isShipped;
      if (wasBothDone !== isBothDoneNow) {
        const preorder = await requestToPromise(stores.preorders.get(record.preorderId));
        if (preorder) {
          const product = await requestToPromise(stores.products.get(preorder.productId));
          if (product) {
            const qty = Number(preorder.quantity) || 0;
            if (isBothDoneNow) {
              product.stock = Math.max(0, (Number(product.stock) || 0) - qty);
            } else {
              product.stock = (Number(product.stock) || 0) + qty;
            }
            product.updatedAt = now;
            stores.products.put(product);
          }

          if (isBothDoneNow) {
            const productName = product ? product.name : "未知商品";
            stores.purchaseHistory.add({
              id: uid(),
              customerId: preorder.customerId,
              productName,
              quantity: Number(preorder.quantity) || 0,
              note: preorder.note || "",
              costPrice: Number(preorder.costPrice) || 0,
              salePrice: Number(preorder.salePrice) || 0,
              discount: 0,
              shippedAt: record.shippedAt || now,
              createdAt: now
            });
            stores.fulfillments.delete(fulfillmentId);
            stores.preorders.delete(record.preorderId);
            return { archived: true };
          }
        }
      }
      const normalized = ensureFulfillmentFlags(record);
      normalized.completedAt = normalized.isCompleted ? normalized.completedAt || now : "";
      record.updatedAt = nowISO();
      stores.fulfillments.put({ ...normalized, updatedAt: now });
      return normalized;
    });
  }

  async function markPreorderBought(preorderId) {
    return withTransaction(["preorders", "products"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.preorders.get(preorderId));
      if (!record) {
        throw new Error("订单不存在");
      }
      record.isBought = true;
      record.updatedAt = nowISO();
      stores.preorders.put(record);

      const product = await requestToPromise(stores.products.get(record.productId));
      if (product) {
        product.stock = (Number(product.stock) || 0) + (Number(record.quantity) || 0);
        product.updatedAt = nowISO();
        stores.products.put(product);
      }

      return record;
    });
  }

  async function updatePreorder(preorderId, input) {
    const categoryName = String(input.categoryName || "").trim();
    const category = categoryName ? await addOrGetCategory(categoryName) : null;
    const customer = await addOrGetCustomer(input.customerName);
    const productResult = await addOrGetProduct(input.productName, category ? category.id : "", {
      costPrice: input.costPrice,
      salePrice: input.salePrice
    });
    const product = productResult.product;
    const now = nowISO();
    var savedRecord = await withTransaction(["preorders", "fulfillments"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.preorders.get(preorderId));
      if (!record) {
        throw new Error("订单不存在");
      }
      record.categoryId = category ? category.id : "";
      record.customerId = customer.id;
      record.productId = product.id;
      record.quantity = Number(input.quantity) || record.quantity;
      record.costPrice = Number(input.costPrice) || 0;
      record.salePrice = Number(input.salePrice) || 0;
      record.deposit = Number(input.deposit) || 0;
      record.note = String(input.note || "").trim();
      record.updatedAt = now;
      stores.preorders.put(record);

      const linked = await requestToPromise(stores.fulfillments.index("preorderId").getAll(preorderId));
      for (const f of linked) {
        f.customerId = customer.id;
        f.updatedAt = now;
        stores.fulfillments.put(f);
      }
      return record;
    });

    if (!savedRecord.batchId) {
      await withTransaction(["products"], "readwrite", async (stores) => {
        var prod = await requestToPromise(stores.products.get(product.id));
        if (prod) {
          prod.costPrice = Number(input.costPrice) || 0;
          prod.salePrice = Number(input.salePrice) || 0;
          prod.updatedAt = nowISO();
          stores.products.put(prod);
        }
      });
    }

    return savedRecord;
  }

  async function deletePreorder(preorderId) {
    return withTransaction(["preorders", "fulfillments"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.preorders.get(preorderId));
      if (!record) {
        throw new Error("订单不存在");
      }
      stores.preorders.delete(preorderId);
      const linked = await requestToPromise(stores.fulfillments.index("preorderId").getAll(preorderId));
      for (const f of linked) {
        stores.fulfillments.delete(f.id);
      }
      return record;
    });
  }

  async function removeFulfillmentItem(fulfillmentId) {
    return withTransaction(["preorders", "fulfillments"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.fulfillments.get(fulfillmentId));
      if (!record) {
        throw new Error("记录不存在");
      }
      stores.fulfillments.delete(fulfillmentId);
      if (record.preorderId) {
        stores.preorders.delete(record.preorderId);
      }
      return record;
    });
  }

  async function toggleFulfillmentPaid(fulfillmentId, nextValue) {
    return toggleFulfillmentStatus(fulfillmentId, "paid", nextValue);
  }

  async function toggleFulfillmentShipped(fulfillmentId, nextValue) {
    return toggleFulfillmentStatus(fulfillmentId, "shipped", nextValue);
  }

  async function toggleFulfillment(fulfillmentId, nextCompleted) {
    const target = !!nextCompleted;
    await toggleFulfillmentPaid(fulfillmentId, target);
    return toggleFulfillmentShipped(fulfillmentId, target);
  }

  async function getCompletedStats(startDate, endDate) {
    const start = startDate ? new Date(startDate + "T00:00:00").getTime() : Number.NEGATIVE_INFINITY;
    const end = endDate ? new Date(endDate + "T23:59:59").getTime() : Number.POSITIVE_INFINITY;

    const [allHistory, customers] = await Promise.all([
      getAll("purchaseHistory"),
      getAll("customers")
    ]);
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return allHistory
      .filter((h) => {
        const t = new Date(h.createdAt || h.shippedAt).getTime();
        return t >= start && t <= end;
      })
      .map((h) => {
        const customer = customerMap.get(h.customerId);
        const qty = Number(h.quantity) || 0;
        const costPrice = Number(h.costPrice) || 0;
        const salePrice = Number(h.salePrice) || 0;
        return {
          preorderId: h.id,
          customerId: h.customerId,
          customerName: (customer && customer.name) || "未知客户",
          productName: h.productName || "未知商品",
          quantity: qty,
          costPrice,
          salePrice,
          deposit: 0,
          discount: Number(h.discount) || 0,
          totalCost: qty * costPrice,
          totalIncome: qty * salePrice,
          completedAt: h.createdAt || h.shippedAt
        };
      });
  }

  async function saveCustomerBilling(customerId, payload) {
    if (!customerId) {
      throw new Error("缺少客户信息");
    }
    const rows = Array.isArray(payload && payload.rows) ? payload.rows : [];
    const shippingFee = Number(payload && payload.shippingFee) || 0;
    const discount = Number(payload && payload.discount) || 0;
    const discountPerRow = rows.length > 0 ? Math.round(discount / rows.length * 100) / 100 : 0;
    const now = nowISO();
    return withTransaction(["preorders", "fulfillments", "purchaseHistory"], "readwrite", async (stores) => {
      // 如果有优惠，直接写一条优惠记录到 purchaseHistory
      if (discount > 0 && customerId) {
        stores.purchaseHistory.add({
          id: uid(),
          customerId: customerId,
          productName: "优惠减免",
          quantity: 1,
          note: "",
          costPrice: 0,
          salePrice: 0,
          discount: discount,
          shippedAt: now,
          createdAt: now
        });
      }
      for (const row of rows) {
        const preorder = await requestToPromise(stores.preorders.get(row.preorderId));
        const fulfillment = await requestToPromise(stores.fulfillments.get(row.fulfillmentId));
        if (!preorder || !fulfillment) {
          continue;
        }
        preorder.quantity = Number(row.quantity) || preorder.quantity;
        preorder.salePrice = Number(row.salePrice) || 0;
        preorder.deposit = Number(row.deposit) || 0;
        if (row.batchId) {
          preorder.batchId = row.batchId;
        }
        preorder.note = String(preorder.note || "");
        preorder.updatedAt = now;
        stores.preorders.put(preorder);

        fulfillment.isPaid = !!row.isPaid;
        fulfillment.paidAt = fulfillment.isPaid ? now : "";
        if (!fulfillment.isShipped) {
          fulfillment.isShipped = false;
          fulfillment.shippedAt = fulfillment.shippedAt || "";
        }
        const normalized = ensureFulfillmentFlags(fulfillment);
        normalized.updatedAt = now;
        stores.fulfillments.put(normalized);
      }
      return { shippingFee };
    });
  }

  async function saveCategory(id, name) {
    const now = nowISO();
    const cleanName = String(name || "").trim();
    if (!cleanName) {
      throw new Error("分类名称不能为空");
    }
    const existingByName = await findByName("categories", cleanName);
    if (existingByName && existingByName.id !== id) {
      throw new Error("分类名称已存在");
    }
    return withTransaction(["categories"], "readwrite", async (stores) => {
      let entity = null;
      if (id) {
        entity = await requestToPromise(stores.categories.get(id));
      }
      const data = {
        id: id || uid(),
        name: cleanName,
        nameLower: normalizeName(cleanName),
        createdAt: (entity && entity.createdAt) || now,
        updatedAt: now
      };
      stores.categories.put(data);
      return data;
    });
  }

  async function saveCustomer(id, name) {
    const now = nowISO();
    const cleanName = String(name || "").trim();
    if (!cleanName) {
      throw new Error("客户姓名不能为空");
    }
    const existingByName = await findByName("customers", cleanName);
    if (existingByName && existingByName.id !== id) {
      throw new Error("客户名称已存在");
    }
    return withTransaction(["customers"], "readwrite", async (stores) => {
      let entity = null;
      if (id) {
        entity = await requestToPromise(stores.customers.get(id));
      }
      const data = {
        id: id || uid(),
        name: cleanName,
        nameLower: normalizeName(cleanName),
        createdAt: (entity && entity.createdAt) || now,
        updatedAt: now
      };
      stores.customers.put(data);
      return data;
    });
  }

  async function saveProduct(input) {
    const now = nowISO();
    const cleanName = String(input.name || "").trim();
    if (!cleanName) {
      throw new Error("商品名称不能为空");
    }
    const existingByName = await findByName("products", cleanName);
    if (existingByName && existingByName.id !== input.id) {
      throw new Error("商品名称已存在");
    }
    return withTransaction(["products"], "readwrite", async (stores) => {
      let entity = null;
      if (input.id) {
        entity = await requestToPromise(stores.products.get(input.id));
      }
      const data = {
        id: input.id || uid(),
        name: cleanName,
        nameLower: normalizeName(cleanName),
        categoryId: input.categoryId || "",
        stock: Number(input.stock) || 0,
        costPrice: Number(input.costPrice) || 0,
        salePrice: Number(input.salePrice) || 0,
        createdAt: (entity && entity.createdAt) || now,
        updatedAt: now
      };
      stores.products.put(data);
      return data;
    });
  }

  async function removeCategory(id) {
    return withTransaction(["categories", "products", "preorders"], "readwrite", async (stores) => {
      const [products, preorders] = await Promise.all([
        requestToPromise(stores.products.getAll()),
        requestToPromise(stores.preorders.getAll())
      ]);
      const inUse = products.some((item) => item.categoryId === id) || preorders.some((item) => item.categoryId === id);
      if (inUse) {
        throw new Error("该分类已被引用，请先迁移关联商品或订单");
      }
      stores.categories.delete(id);
    });
  }

  async function removeCustomer(id) {
    return withTransaction(["customers", "preorders"], "readwrite", async (stores) => {
      const preorders = await requestToPromise(stores.preorders.getAll());
      if (preorders.some((item) => item.customerId === id)) {
        throw new Error("该客户存在关联订单，无法删除");
      }
      stores.customers.delete(id);
    });
  }

  async function removeProduct(id) {
    return withTransaction(["products", "preorders", "productBatches"], "readwrite", async (stores) => {
      const preorders = await requestToPromise(stores.preorders.getAll());
      if (preorders.some((item) => item.productId === id)) {
        throw new Error("该商品存在关联订单，无法删除");
      }
      stores.products.delete(id);
      const batches = await requestToPromise(stores.productBatches.getAll());
      batches.filter((x) => x.productId === id).forEach((x) => stores.productBatches.delete(x.id));
    });
  }

  async function getPurchaseHistoryByCustomer(customerId) {
    const all = await getAll("purchaseHistory");
    return all
      .filter((item) => item.customerId === customerId)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  async function listPurchaseHistory() {
    return getAll("purchaseHistory");
  }

  async function removePurchaseHistory(id) {
    return withTransaction(["purchaseHistory"], "readwrite", async (stores) => {
      stores.purchaseHistory.delete(id);
    });
  }


  async function updatePurchaseHistory(id, changes) {
    return withTransaction(["purchaseHistory"], "readwrite", async (stores) => {
      const record = await requestToPromise(stores.purchaseHistory.get(id));
      if (!record) throw new Error("记录不存在");
      Object.assign(record, changes, { updatedAt: nowISO() });
      stores.purchaseHistory.put(record);
      return record;
    });
  }
  async function removeBatch(id) {
    return withTransaction(["productBatches"], "readwrite", async (stores) => {
      stores.productBatches.delete(id);
    });
  }

  async function exportAllData() {
    const data = {};
    for (const name of STORE_NAMES) {
      data[name] = await getAll(name);
    }
    return {
      meta: {
        app: "daigou-accounting",
        dbName: DB_NAME,
        schemaVersion: DB_VERSION,
        exportedAt: nowISO()
      },
      data
    };
  }

  async function importAllData(payload) {
    if (!payload || typeof payload !== "object" || !payload.data || typeof payload.data !== "object") {
      throw new Error("备份文件格式不正确");
    }
    var totalRows = 0;
    await withTransaction(STORE_NAMES, "readwrite", async (stores) => {
      for (const name of STORE_NAMES) {
        stores[name].clear();
      }
      for (const name of STORE_NAMES) {
        const rows = Array.isArray(payload.data[name]) ? payload.data[name] : [];
        rows.forEach((row) => {
          if (row && typeof row === "object") {
            if (!row.id) row.id = uid();
            stores[name].put(row);
            totalRows++;
          }
        });
      }
    });
    if (totalRows === 0) {
      throw new Error("备份文件中没有有效数据");
    }
    return true;
  }

  var BACKUP_KEY = "daigou-auto-backup";
  var SYNC_KEY_STORAGE = "daigou-sync-key";
  var CLOUD_URL = "https://daigou-backup.charlie0476.workers.dev";

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      expires = "; expires=" + d.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getSyncKey() {
    var key = (localStorage.getItem(SYNC_KEY_STORAGE) || "").trim();
    if (!key) {
      key = getCookie("daigou_sync_key");
      if (key) {
        localStorage.setItem(SYNC_KEY_STORAGE, key);
      }
    }
    return key;
  }

  function setSyncKey(key) {
    var clean = (key || "").trim();
    localStorage.setItem(SYNC_KEY_STORAGE, clean);
    setCookie("daigou_sync_key", clean, 365);
  }

  async function cloudUpload() {
    var syncKey = getSyncKey();
    if (!syncKey || syncKey.length < 4) {
      throw new Error("请先设置4位以上的同步密钥");
    }
    var payload = await exportAllData();
    var tables = payload && payload.data;
    if (tables) {
      var hasData = false;
      for (var k in tables) {
        if (Array.isArray(tables[k]) && tables[k].length > 0) { hasData = true; break; }
      }
      if (!hasData) {
        throw new Error("本地数据为空，已跳过上传以保护云端备份");
      }
    }
    var resp = await fetch(CLOUD_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Sync-Key": syncKey },
      body: JSON.stringify(payload)
    });
    var result = await resp.json();
    if (!resp.ok) throw new Error(result.error || "上传失败");
    return result;
  }

  async function cloudDownload() {
    var syncKey = getSyncKey();
    if (!syncKey || syncKey.length < 4) {
      throw new Error("请先设置4位以上的同步密钥");
    }
    var resp = await fetch(CLOUD_URL, {
      method: "GET",
      headers: { "X-Sync-Key": syncKey }
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function () { return {}; });
      throw new Error(err.error || "下载失败");
    }
    return resp.json();
  }

  async function saveAutoBackup() {
    try {
      var payload = await exportAllData();
      localStorage.setItem(BACKUP_KEY, JSON.stringify(payload));
    } catch (e) {
      // silently fail — localStorage might be full
    }
  }

  function getAutoBackup() {
    try {
      var raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      var payload = JSON.parse(raw);
      if (payload && payload.data && payload.meta) return payload;
      return null;
    } catch (e) {
      return null;
    }
  }

  async function isDBEmpty() {
    var counts = await Promise.all(STORE_NAMES.map(function (name) {
      return getAll(name).then(function (rows) { return rows.length; });
    }));
    return counts.every(function (c) { return c === 0; });
  }

  async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      var granted = await navigator.storage.persist();
      return granted;
    }
    return false;
  }

  window.DB = {
    openDB,
    getAllJoined,
    getCompletedStats,
    createPreorderWithAutoCreate,
    markPreorderBought,
    updatePreorder,
    deletePreorder,
    removeFulfillmentItem,
    toggleFulfillment,
    toggleFulfillmentPaid,
    toggleFulfillmentShipped,
    saveCustomerBilling,
    searchCategoryNames: (keyword) => searchNames("categories", keyword),
    searchCustomerNames: (keyword) => searchNames("customers", keyword),
    searchProductNames: (keyword, categoryId) => searchProductNames(keyword, categoryId),
    findCategoryByName,
    listCategories: () => getAll("categories"),
    listCustomers: () => getAll("customers"),
    listProducts: () => getAll("products"),
    listProductBatches: () => getAll("productBatches"),
    getProductBatchesWithStock: async function (productId) {
      var all = await getAll("productBatches");
      return all.filter(function (b) { return b.productId === productId && Number(b.stock) > 0; });
    },
    getProductByName,
    addOrUpdateProductBatch,
    saveCategory,
    saveCustomer,
    saveProduct,
    removeCategory,
    removeCustomer,
    removeProduct,
    getPurchaseHistoryByCustomer,
    listPurchaseHistory,
    removePurchaseHistory,
    updatePurchaseHistory,
    removeBatch,
    exportAllData,
    importAllData,
    saveAutoBackup,
    getAutoBackup,
    isDBEmpty,
    requestPersistentStorage,
    getSyncKey,
    setSyncKey,
    cloudUpload,
    cloudDownload
  };
})();
