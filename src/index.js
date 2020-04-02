async function test_data() {
    await query("DELETE FROM public.user; DELETE FROM srql; DELETE FROM srql_member");

    tables = [];
    var files = fs.readdirSync("./test/db");

    for (let i = 0; i < files.length; i++) {
        tables.push({ [files[i].split(".")[0]]: await parser().fromFile("./test/db/" + files[i]) });
    }
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        var table_name = Object.keys(table)[0];
        var column_names = Object.keys(table[table_name][0]);
        for (let n = 0; n < table[table_name].length; n++) {
            const row = table[table_name][n];
            let name = table_name.split(".")[0].replace(/([0-9\-])+/g, "");
            let q = `INSERT INTO public.${name} VALUES (`;
            for (let i = 0; i < column_names.length; i++) {
                q += `'${row[column_names[i]]}', `;
            }
            q = q.slice(0, q.length - 2);
            q += ")"
            await query(q);
        }
    }
}

$(document).ready(async () => {
    
});