export default async function decorate(block) {
    const isUE = isUniversalEditorActive();
    const persistedQuery = (isUE) ? useAuthorQuery(persistedQuery) : block.textContent;
    const categories = await getCategories(persistedQuery);
    
    const root = document.createElement('ul', {"class": "article-items"});
    
    categories.forEach((category) => {
        const elem = document.createElement('li');
        elem.setAttribute("class", "article-item");
        elem.setAttribute("itemscope", "");
        elem.setAttribute("itemid", `urn:aemconnection:${category._path}/jcr:content/data/master`);
        elem.setAttribute("itemtype", "reference");
        elem.innerHTML = `
            <img class="article-item-image" src="${category.image}" alt="${category.title}" itemprop="primaryImage" itemtype="image" loading="lazy">
            <div class="article-item-title" itemprop="title" itemtype="text">
                <h5>${category.title}</h5></div>
            </div>
            <div class="article-item-desc" itemprop="main" itemtype="richtext">${category.description}</div>`;
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
    const json = await fetch(persistedQuery.trim()+"&ts="+Math.random()*1000, {credentials: "include"})
        .then((response) => response.json());
    const items = json?.data?.categoryList?.items || []
    return items.map((item) => {
        return {
            _path: item._path,
            title: item.title,
            description: item.description["plaintext"],
            cta: { 
                text: item.ctaText,
                link: item.ctaLink,
            },
            image: new URL(item.image["_publishUrl"]),
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