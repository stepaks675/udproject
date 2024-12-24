import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PostgresService } from './postgres/postgres.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly dbService: PostgresService) {}

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; 
    }
    return hash;
  }
  


  @Get("/publishers")
  async getPublishers() {
    const res = await this.dbService.query("SELECT get_all_publishers();")
    return res.rows;
  }
  
  @Post("/publishers")
  async createPublisher(@Body() body){
    await this.dbService.query("CALL add_publisher($1, $2);",[body.name, body.country])

    const hashid = Math.abs(this.hashString(body.name))


    await this.dbService.query("CALL setup_publisher_environment($1, $2, $3);",[hashid, body.name, "qwerty123"])

    await this.dbService.query("CALL setup_publisher_tables($1);",[hashid])

    await this.dbService.query("CALL grant_publisher_permissions($1,$2);",[hashid, body.name])
  }


  @Delete("/publishers")
  async deletePublisher(@Body() body){
    await this.dbService.query("CALL delete_publisher($1);",[parseInt(body.id)])
    await this.dbService.query("CALL delete_publisher_schema($1)", [Math.abs(this.hashString(body.name))] )
    await this.dbService.query("CALL delete_role($1);",[body.name])
  }
  @Delete("/games")
  async deleteGame(@Body() body){
    await this.dbService.query("CALL delete_game($1);", [parseInt(body.id)])
  }
  @Delete("/users")
  async deleteUser(@Body() body){
    await this.dbService.query("CALL delete_user($1);", [parseInt(body.id)])
  }
  @Get("/gamepub")
  async getGameByPub(@Query('id') id){
    const res = await this.dbService.query("SELECT get_games_by_publisher($1);", [parseInt(id)])
    return res.rows
  }
  @Post("/games")
  async createGame(@Body() body){
    this.dbService.query("CALL add_game($1, $2, $3, $4);", [body.title, body.genre, body.releaseyear, body.publisher_id])
  }
  @Get("/users")
  async getAllUsers(){
    const res = await this.dbService.query("SELECT get_all_users();");
    return res.rows;
  }
  @Get("/games")
  async getAllGames(){
    const res = await this.dbService.query("SELECT get_all_games();")
    return res.rows
  }
  @Post("/fav")
  async setFav(@Body() body){
    await this.dbService.query("CALL set_favorite_game($1, $2);", [parseInt(body.userid), parseInt(body.id)])
  }
  @Post("/gamesbyname")
  async findGames(@Body() body){
    const res = await this.dbService.query("SELECT search_games_by_title($1);", [body.title])
    return res.rows
  }

  @Post("/reviews")
  async addReview(@Body() body){
    await this.dbService.query("CALL upsert_review($1, $2, $3, $4);", [parseInt(body.userid), parseInt(body.gameid), parseInt(body.score), body.comment])
  }
  @Get("/reviews")
  async getReviewsByGame(@Query("gameid") gid){
    const result = await this.dbService.query("SELECT get_reviews_by_game($1);",[gid])
    return result.rows
  }
  @Get("/newuser")
  async createUser(@Query("name") name){
    await this.dbService.query("CALL add_user($1);",[name])
  }

  @Post("/cheats")
  async createCheat(@Body() body){
    await this.dbService.connectDedicatedUser(body.name)
    await this.dbService.query(`CALL publisher_${Math.abs(this.hashString(body.name))}.add_cheat_code($1,$2,$3)`,[body.gameid, body.cheat, body.desc])
    await this.dbService.disconnectClient()
    await this.dbService.connectToDatabase("projectud")
  }
  @Post("/getcheats")
  async getCheats(@Body() body){
    await this.dbService.connectDedicatedUser(body.name)
    const res = await this.dbService.query(`SELECT publisher_${Math.abs(this.hashString(body.name))}.get_cheat_codes();`)
    await this.dbService.disconnectClient()
    await this.dbService.connectToDatabase("projectud")
    return res.rows;
  }

  @Post("/admin/deleteuser")
  async deleteUserByText(@Body() body){
    if (body.pincode == "adminadmin"){
      await this.dbService.query("CALL delete_user_by_name($1)", [body.username])
    }
  }

  @Delete("/admin/reviews")
  async deleteReviews(@Body() body){
    if (body.pincode == "adminadmin"){
      await this.dbService.query("CALL clear_reviews();")
    }
  }

  @Delete("admin/purge")
  async purgeAll(@Body() body){
    if (body.pincode == "adminadmin"){
      await this.dbService.query("CALL clear_all();")
    }
  }
}
