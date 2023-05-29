export default async function decorate(block) {
    const isUE = isUniversalEditorActive();
    const persistedQuery = (isUE) ? useAuthorQuery(persistedQuery) : block.textContent;
    const categories = await getCategories(persistedQuery);
    
    const root = document.createElement('div');
    root.setAttribute("class", "category-list");
    
    categories.forEach((category) => {
        const elem = document.createElement('div');
        elem.setAttribute("class", "category-item");
        elem.setAttribute("itemscope", "");
        elem.setAttribute("itemid", `urn:aemconnection:${category._path}/jcr:content/data/master`);
        elem.setAttribute("itemtype", "reference");
        elem.innerHTML = `
            <div class="category-item-image">
                <picture>
                    <source type="image/webp" srcset="${category.image.url}?preferweb=true" media="(min-width: 600px)">
                    <source type="image/webp" srcset="${category.image.url}?preferweb=true&width=750>
                    <source type="${category.image.mimeType}" srcset="${category.image.url}" media="(min-width: 600px)">
                    <img loading="eager" alt="${category.title}" type="${category.image.mimeType}" src="${category.image.url}" width="${category.image.width}" height="${category.image.height}">
                </picture>
                <img src="${category.image.url}" alt="${category.title}" itemprop="primaryImage" itemtype="image" loading="lazy">
            </div>
            <div class="category-item-content">
                <h5 class="category-item-title" itemprop="title" itemtype="text">${category.title}</h5>
                <p class="category-item-desc" itemprop="main" itemtype="richtext">${category.description}</p>
            </div>`;
        root.appendChild(elem);
    });
    block.textContent = "";
    block.append(root);
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Category
 * @property {string} _path - Path to the category content fragment.
 * @property {string} title - Title of the category.
 * @property {string} description - Description of the category.
 * @property {string} ctaText - Call to action text.
 * @property {string} ctaLink - Call to action link.
 * @property {URL} image - Image for the category.
 */

/**
 * @async
 * @param {string} persistedQuery
 * @return {Promise<Category[]>} results 
 */
async function getCategories(persistedQuery) {
    const url = addCacheKiller(persistedQuery);
    const json = await fetch(url, {
        credentials: "include"
    }).then((response) => response.json());
    const items = json?.data?.categoryList?.items || []
    return items.map((item) => {
        const publishUrl = new URL(item.image["_publishUrl"]);
        return {
            _path: item._path,
            title: item.title,
            description: item.description["plaintext"],
            cta: { 
                text: item.ctaText,
                link: item.ctaLink,
            },
            image: {
                url: `https://${publishUrl.hostname}${item.image["_dynamicUrl"]}`,
                width: item.image["width"],
                height: item.image["height"],
                mimeType: item.image["mimeType"],
            },
        };
    });

}
/**
 * Detects whether the site is embedded in the universal editor by counting parent frames
 * @returns {boolean}
 */
function isUniversalEditorActive() {
    return window.location.ancestorOrigins > 0;
}

/**
 * Update the persisted query url to use the authoring endpoint
 * @param {string} persistedQuery 
 * @returns {string}
 */
function useAuthorQuery(persistedQuery) {
    return persistedQuery.replace("//publish-", "//author-");
}

/**
 * Updates url to contain a query parameter to prevent caching
 * @param {string} url 
 * @returns url with cache killer query parameter
 */
function addCacheKiller(url) {
    let newUrl = new URL(url);
    let params = newUrl.searchParams;
    params.append("ck", Date.now());
    return newUrl.toString();
}