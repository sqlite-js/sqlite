#![feature(test)]
extern crate test;
#[macro_use]
extern crate neon;
extern crate rusqlite;

use neon::prelude::*;
use rusqlite::{Connection, NO_PARAMS};

fn version(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string(rusqlite::version::version()))
}

pub struct Sqlite {
    pub conn: Option<Connection>,
    pub database: Option<String>,
    pub verbose: Option<bool>,
}

declare_types! {
    pub class JsSqlite for Sqlite {
        init(_cx) {
            Ok(Sqlite {
                conn: None,
                database: None,
                verbose: None
            })
        }

        method open(mut cx) {
            let database_value: String;
            let verbose_value: bool;

            match cx.argument_opt(0) {
                Some(arg) => {
                    let obj = arg.downcast::<JsObject>().or_throw(&mut cx)?;
                    // Handle verbose property defaults
                    if obj.get(&mut cx, "verbose")?.is_a::<JsUndefined>() {
                        verbose_value = true;
                    } else {
                        verbose_value = obj.get(&mut cx, "verbose")?.downcast::<JsBoolean>().or_throw(&mut cx)?.value();
                    }
                    // Handle database property defaults
                    if obj.get(&mut cx, "database")?.is_a::<JsUndefined>() {
                        database_value = ":memory:".to_string();
                    } else {
                        database_value = obj.get(&mut cx, "database")?.downcast::<JsString>().or_throw(&mut cx)?.value();
                    }
                },
                None => {
                    database_value = ":memory:".to_string();
                    verbose_value = true;
                }
            }

            let conn = if database_value == ":memory:".to_string() {
                Connection::open_in_memory().unwrap()
            } else {
                Connection::open(&database_value).unwrap()
            };

            let js_database_value = cx.string(database_value);
            let js_verbose_value = cx.boolean(verbose_value);

            let mut this = cx.this();
            this.set(&mut cx, "database", js_database_value)?;
            this.set(&mut cx, "verbose", js_verbose_value)?;
            cx.borrow_mut(&mut this, |mut sqlite| {
                sqlite.conn = Some(conn);
            });

            Ok(this.upcast())
        }

        method execute(mut cx) {
            let sql = cx.argument::<JsString>(0)?.value();
            let this = cx.this();

            let vec = cx.borrow(&this, |sqlite| {
                let conn = (&sqlite.conn).as_ref().unwrap();
                let mut stmt = conn.prepare(&sql).unwrap();
                let res: Vec<String> = stmt
                    .query_map(NO_PARAMS, |row| row.get(0))
                    .unwrap()
                    .into_iter()
                    .map(|r| r.unwrap())
                    .collect();
                res
            });

            let js_array = JsArray::new(&mut cx, vec.len() as u32);
            vec.iter()
                .enumerate()
                .for_each(|(i, obj)| {
                    let js_string = cx.string(obj);
                    js_array.set(&mut cx, i as u32, js_string).unwrap();
                });

            Ok(js_array.upcast())
        }

        method prepare(mut cx) {
            let sql = cx.argument::<JsString>(0)?.value();
            let this = cx.this();

            let _ = cx.borrow(&this, |sqlite| {
                let conn = (&sqlite.conn).as_ref().unwrap();
                let _ = conn.prepare(&sql).unwrap();
            });

            Ok(cx.undefined().upcast())
        }
    }
}

register_module!(mut m, {
    m.export_class::<JsSqlite>("Sqlite")?;
    m.export_function("version", version)?;
    Ok(())
});

#[cfg(test)]
mod tests {
    use super::*;
    use test::Bencher;

    #[bench]
    fn bench_create_table_rusqlite(b: &mut Bencher) {
        b.iter(|| {
            let conn = Connection::open_in_memory().unwrap();
            let stmt = conn.prepare("CREATE TABLE lorem (info TEXT)").unwrap();
        });
    }
}
