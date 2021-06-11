<style>
h1 {
  background-color: gold;
  padding: 0.5em;
  border-radius: 0.5em;
}
</style>

<script>
let name = 'world';
let count = 0;

function handleClick() {
  count += 1;
}
</script>

<h1>Hello {name}!</h1>

<button on:click="{handleClick}">
  Clicked {count}
  {count === 1 ? 'time' : 'times'}
</button>
