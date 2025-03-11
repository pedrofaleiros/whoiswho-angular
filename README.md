# Whoiswho App

#### WhoIsWho: https://whoiswho-angular.vercel.app

#### Repositorio do backend: https://github.com/pedrofaleiros/whoiswho-java

## Sobre o Jogo

Em uma partida, um jogador cria uma sala onde os demais se reúnem para jogar. No início, um local é sorteado e cada participante recebe uma profissão relacionada a esse local, com exceção dos impostores, que não têm essa informação.

Durante as rodadas, todos compartilham pistas sobre suas profissões e o local, tentando identificar os impostores sem revelar demais sobre si mesmos. Ao final de cada rodada, os jogadores podem optar por votar para eliminar um suspeito ou seguir sem eliminações.

Para que um jogador seja eliminado, é necessário que ele receba a maioria dos votos; se houver empate, ninguém é eliminado.

O jogo termina quando:

- Todos os impostores são descobertos e eliminados;
- Um impostor consegue eliminar jogadores até restar apenas ele e mais um;
- Os impostores passam a ser a maioria.

O número de impostores varia de 1 a 3, sempre iniciando como minoria entre os jogadores.

> **Obs:** O backend utiliza escalonamento automático com instâncias mínimas configuradas para 0. Portanto, após um período de inatividade, a primeira requisição pode sofrer um cold start, resultando em um breve atraso na resposta. Esse comportamento é esperado e visa otimizar a utilização de recursos.
