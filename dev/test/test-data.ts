const csvParser = require("csvtojson");
const fs = require("fs");
const { ClientFactory } = require("../dev/src/core/db");

var client;

prepare_db();

async function prepare_db() {
	const clientFactory = new ClientFactory();
	client = await clientFactory.new();

	await delete_all_data();
	await insert_test_data();
}

async function delete_all_data() {
	client.query(
		"DELETE FROM public.user; DELETE FROM srql; DELETE FROM srql_member"
	);
}

async function insert_test_data() {
	const tables = await Promise.all(
		fs.readdirSync("./test/db/").map(get_table_data)
	);
	for (const [table_name, rows] of tables) {
		rows.forEach((row) => insert_row(table_name, row));
	}
}

async function insert_row(table_name, row) {
	const value_string = Object.values(row)
		.map((data) => `'${data}'`)
		.join(", ");
	await client.query(
		`INSERT INTO public.${table_name} VALUES (${value_string})`
	);
}

async function get_table_data(filename) {
	const table_name = filename.split(".")[0].replace(/[0-9]\-/g, "");
	return [table_name, await get_data_from_file(filename)];
}

async function get_data_from_file(filename) {
	return await csvParser().fromFile("./test/db/" + filename);
}

module.exports = {
	insert_test_data,
};
