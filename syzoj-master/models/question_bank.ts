import * as TypeORM from "typeorm";
import Model from "./common";

declare var syzoj, ErrorMessage: any;

import * as LRUCache from "lru-cache";

const problemTagCache = new LRUCache<number, number[]>({
  max: syzoj.config.db.cache_size
});

const statisticsCodeOnly = ["fastest", "slowest", "min", "max"];

@TypeORM.Entity()
export default class QuestionBank extends Model {
  static cache = true;

  @TypeORM.PrimaryGeneratedColumn()
  id: number;

  @TypeORM.Column({ nullable: true, type: "integer" })
  time_limit: number;

  @TypeORM.Column({ nullable: true, type: "integer" })
  memory_limit: number;
   
 async validate() {
    if (this.time_limit <= 0 || this.time_limit > 60000) 
                this.time_limit = 60000;
    if (this.memory_limit <= 0 || this.memory_limit > 1024) 
                this.memory_limit = 1024;
  }
}
