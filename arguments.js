module.exports.getArgument = (key, notFound) => {
    const a = process.argv.indexOf(`--${key}`);
    if (a == -1) {
        return notFound;
    }
    return process.argv[a + 1];
};