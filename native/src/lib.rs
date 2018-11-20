#[macro_use]
extern crate neon;
extern crate rusqlite;

use rusqlite::version::{version as sqlite_version};
use neon::prelude::*;

fn version(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(sqlite_version()))
}

register_module!(mut m, {
    m.export_function("version", version)
});
