<script lang="ts">
import type { Snippet } from 'svelte'

import '@csstools/normalize.css'

type Props = {
  children: Snippet
}

const { children }: Props = $props()
</script>

{@render children()}
