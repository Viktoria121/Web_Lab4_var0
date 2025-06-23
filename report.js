const cart = JSON.parse(localStorage.getItem("cart")) || [];

const reportData = cart.map(item => ({
    name: item.name,
    description: item.description || "Без категорії",
    sizeText: item.sizeText,
    count: item.count,
    price: item.price * item.count,
    discount: item.price * item.count * 0.2,
    priceWithDiscount: item.price * 0.8
}));

const pivot = new WebDataRocks({
    container: "#wdr-component",
    toolbar: true,
    height: 600,
    width: "100%",
    report: {
        dataSource: {
            data: reportData
        },
        slice: {
            rows: [
                { uniqueName: "description" },
                { uniqueName: "name" }
            ],
            columns: [
                { uniqueName: "sizeText" },
                { uniqueName: "Measures" }
            ],
            measures: [
                { uniqueName: "count", aggregation: "sum", format: "integer" },
                { uniqueName: "price", aggregation: "sum", format: "currency" },
                { uniqueName: "discount", aggregation: "sum", format: "currency" },
                { uniqueName: "priceWithDiscount", aggregation: "sum", format: "currency" },
            ]
        },
        formats: [
            {
                name: "currency",
                currencySymbol: "₴",
                currencySymbolAlign: "right",
                thousandsSeparator: " ",
                decimalPlaces: 2
            },
            {
                name: "integer",
                decimalPlaces: 0
            }
        ],
        conditions: [
            {
                formula: "#value > 0",
                measure: "discount",
                format: {
                    backgroundColor: "#90EE90",
                    color: "#000000",
                    fontWeight: "bold"
                }
            },
            {
                formula: "#value > 0",
                measure: "priceWithDiscount",
                format: {
                    backgroundColor: "#f28b82",
                    color: "#000"
                }
            }
        ]
    }
});
