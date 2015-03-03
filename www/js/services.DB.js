define(['app', 'config'], function(app)
{
  app.factory('DB', ['Auth', '$timeout', 'Api', '$q', 'DB_CONFIG',
    function(Auth, $timeout, Api, $q, DB_CONFIG) {
      self.db = null;

      self.init = function() {
        //打开数据库
        if (ionic.Platform.isWebView()){
          self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name});
        } else {
          self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }

        //建表
        angular.forEach(DB_CONFIG.tables, function(table) {
          var columns = [];

          angular.forEach(table.columns, function(column) {
            columns.push(column.name + ' ' + column.type);
          });
          var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
          self.query(query);
          console.log('Table ' + table.name + ' initialized');
        });
      };

      //执行数据库操作
      self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];

        return Thenjs(function(defer){
          self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
              defer(undefined, result);
            }, function(transaction, error) {
              defer(error);
            });
          });
        });
      };

      //获取整个结果集
      self.fetchAll = function(result, ifFlat) {
        var output = [];
        if (ifFlat){
          for (var i = 0; i < result.rows.length; i++) {
            output.push(JSON.parse(result.rows.item(i).data));
          }
        } else {
          for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
          }
        }
        return output;
      };

      //获取单条记录
      self.fetch = function(result) {
        return result.rows.item(0);
      };

      //查询整表
      self.queryAll = function(table){
        return self.query('SELECT * FROM ' + table)
        .then(function(defer, result){
          console.debug(result)
          defer(undefined, self.fetchAll(result));
        }, function(defer, error){
          defer(error);
        });
      }

      self.flatSave = function(tableName, idColName, data){
        return self.query('DROP TABLE IF EXISTS ' + tableName)
        .then(function(defer){
          self.query('CREATE TABLE ' + tableName + ' (id text primary key, data text)')
          .then(function(ctDefer){
            defer(undefined);
          }, function(ctDefer, error){
            defer(error);
          })
        }, function(defer, error){
          defer(error)
        })
        .then(function(defer){
          if (_.isArray(data)){

          } else {
            self.query("INSERT INTO " + tableName + " (id, data) values (?, ?)", 
              [data[idColName], JSON.stringify(data)]
            );
          }
          defer(undefined);
        }, function(defer, error){
          defer(error)
        });
      }

      //查询整表
      self.flatQueryAll = function(table){
        return self.query('SELECT data FROM ' + table)
        .then(function(defer, result){
          console.debug(result)
          defer(undefined, self.fetchAll(result, true));
        }, function(defer, error){
          defer(error);
        });
      }
      return self;
    }]
  )
});
