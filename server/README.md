## Descripción de los modelos
| Clase | Propiedades |
|:----|:-----|
| ChatID, SessionID, UserID | String hash / UUID / ObjectId |
| User | { id : UserID, active : Boolean, avatar : String, password : String, username : String } |
| Chat | { id : ChatID, active : Boolean, createdOn : Date, participants : [User], title : String } |
| Message | { chat : Chat, createdOn : Date, owner : User, text : String } |
| Session | { accessOn : Date, active : Boolean, expiresOn : Date, user : User } |

## Descripción de los servicios públicos

| Endpoint        | Type | Request           | Response  | Errors | Ready |
|:---------------|:------|:-----------------|:---------|:-----|:--|
|`/user/register`|POST|{ username : String, password : String }|{ id : UserID, session : SessionID, username : String, avatar : String }|user_already_exists|:white_check_mark:|
|`/user/login`|POST|{ username : String, password : String }|{ id : UserID, session : SessionID, username : String, avatar : String }|invalid_login|:white_check_mark:|
|`/user/search`|GET|{ filter : String }|{ contacts : Array[User] }||:white_check_mark:|

## Response
```json
{ status : 'OK'|'error', data : .... }
```
## Descripción de los servicios privados (contexto de la sesión)

Los siguientes servicios requieren el **SessionID** como parte de los parámetros del request.
Si no se incluye o es invalido, se retornará el error `403 not_authorized`

| Endpoint        | Type | { s : SessionID } + Request| Response  | Errors | Ready |
|:---------------|:------|:-----------------|:---------|:-----|:---|
|`/user/photo`|POST|{ file : blob }|{ avatar : String }|invalid_file|:red_circle:|
|`/chat/start`|POST|{ recepient : UserID }|{ id : ChatID }||:white_check_mark:|
|`/chat/{ChatID}`|POST|{ message : String }|OK|invalid_message||

| Endpoint        | Type | { s : SessionID } + Request| Response  | Details | Ready |
|:---------------|:------|:-----------------|:---------|:----|:---|
|`/user/logout`|GET||OK||:white_check_mark:|
|`/chat/list`|GET||{ chats : Array[Chat] }|paginacion|:white_check_mark:|
|`/chat/{ChatID}`|GET||{ id : ChatID, messages : Array[Message] }|historico,paginacion||

**Pagination** : { page : P/1, limit : X/10 }