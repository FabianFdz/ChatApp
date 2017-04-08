## Descripción de las clases
| Clase | Propiedades |
|:----|:-----|
| SessionID, ChatID | String hash |
| User | { id : UUID, username : String } |
| Chat | { id : ChatID, contact : User } |
| Message | { text : String } |

## Descripción de los servicios públicos

| Endpoint        | Type | Request           | Response  | Errors |
|:---------------|:------|:-----------------|:---------|:-----|
|`/user/register`|POST|{ username : String, password : String }|{ session : SessionID, username : String, avatar : String }|user_already_exists|
|`/user/login`|POST|{ username : String, password : String }|{ session : SessionID, username : String, avatar : String }|invalid_login|

## Response
```json
{ status : 'OK'|'error', data : .... }
```
## Descripción de los servicios privados (contexto de la sesión)

Los siguientes servicios requieren el **SessionID** como parte de los parámetros del request.
Si no se incluye o es invalido, se retornará el error `403 not_authorized`

| Endpoint        | Type | { s : SessionID } + Request| Response  | Errors |
|:---------------|:------|:-----------------|:---------|:-----|
|`/user/photo`|POST|{ file : blob }|{ avatar : String }|invalid_file|
|`/chat/{ChatID}`|POST|{ message : String }|OK|invalid_message|

| Endpoint        | Type | { s : SessionID } + Request| Response  | Details |
|:---------------|:------|:-----------------|:---------|:----|
|`/user/logout`|GET||OK||
|`/contact/search`|GET|{ filter : String }|{ contacts : Array[User] }|pagination|
|`/chat/list`|GET||{ chats : Array[Chat] }|pagination|
|`/chat/{ChatID}`|GET||{ id : ChatID, messages : Array[Message] }|pagination|

**Pagination** : { page : P/1, limit : X/10 }